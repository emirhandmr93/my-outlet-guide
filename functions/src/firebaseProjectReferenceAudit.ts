import { FieldValue, getFirestore, type CollectionReference, type DocumentReference } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

const TARGET_PROJECT_ID = "my-outlet-guide";
const KNOWN_LEGACY_PROJECT_ID = "hartaeducatiei";
const AUDIT_COLLECTION = "_diagnostics";
const AUDIT_DOCUMENT = "firebaseProjectReferenceAudit";

export const FIREBASE_PROJECT_REFERENCE_AUDIT_SCHEDULE = "0 0 1 1 *";
export const FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_DOCUMENTS = 5_000;
export const FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_FINDINGS = 100;
const MAX_SUBCOLLECTION_DEPTH = 12;

type AuditFinding = {
  kind: "foreign_document_reference" | "deserialize_error";
  documentPath: string;
  fieldPath?: string;
  referencedProjectId?: string;
  referencedDocumentPath?: string;
  message?: string;
};

type AuditState = {
  scannedDocuments: number;
  scannedCollections: number;
  findings: AuditFinding[];
  readErrors: number;
  scanLimitReached: boolean;
};

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1_000);
  return String(error).slice(0, 1_000);
}

function referenceDetails(value: unknown): { projectId: string; path: string } | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {
    path?: unknown;
    firestore?: { projectId?: unknown };
  };
  if (typeof candidate.path !== "string" || !candidate.firestore) return null;
  const projectId = candidate.firestore.projectId;
  return typeof projectId === "string" && projectId ? { projectId, path: candidate.path } : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function inspectValue(
  value: unknown,
  fieldPath: string,
  documentPath: string,
  state: AuditState,
): void {
  if (state.findings.length >= FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_FINDINGS) return;

  const reference = referenceDetails(value);
  if (reference) {
    if (reference.projectId !== TARGET_PROJECT_ID) {
      state.findings.push({
        kind: "foreign_document_reference",
        documentPath,
        fieldPath,
        referencedProjectId: reference.projectId,
        referencedDocumentPath: reference.path,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectValue(item, `${fieldPath}[${index}]`, documentPath, state));
    return;
  }

  if (!isPlainObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    inspectValue(child, fieldPath ? `${fieldPath}.${key}` : key, documentPath, state);
    if (state.findings.length >= FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_FINDINGS) return;
  }
}

async function scanDocument(
  documentRef: DocumentReference,
  depth: number,
  state: AuditState,
): Promise<void> {
  if (state.scannedDocuments >= FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_DOCUMENTS) {
    state.scanLimitReached = true;
    return;
  }

  state.scannedDocuments += 1;
  try {
    const snapshot = await documentRef.get();
    if (snapshot.exists) {
      const data = snapshot.data();
      if (data) inspectValue(data, "", snapshot.ref.path, state);
    }
  } catch (error) {
    state.readErrors += 1;
    const message = safeErrorMessage(error);
    if (
      state.findings.length < FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_FINDINGS &&
      (message.includes("different project") || message.includes(KNOWN_LEGACY_PROJECT_ID))
    ) {
      state.findings.push({
        kind: "deserialize_error",
        documentPath: documentRef.path,
        message,
      });
    } else {
      logger.warn("Firestore reference audit could not read a document", {
        documentPath: documentRef.path,
        message,
      });
    }
  }

  if (depth >= MAX_SUBCOLLECTION_DEPTH || state.scanLimitReached) return;
  try {
    const subcollections = await documentRef.listCollections();
    for (const subcollection of subcollections) {
      await scanCollection(subcollection, depth + 1, state);
      if (state.scanLimitReached) return;
    }
  } catch (error) {
    state.readErrors += 1;
    logger.warn("Firestore reference audit could not list subcollections", {
      documentPath: documentRef.path,
      message: safeErrorMessage(error),
    });
  }
}

async function scanCollection(
  collectionRef: CollectionReference,
  depth: number,
  state: AuditState,
): Promise<void> {
  if (state.scanLimitReached) return;
  state.scannedCollections += 1;

  let documentRefs: DocumentReference[];
  try {
    documentRefs = await collectionRef.listDocuments();
  } catch (error) {
    state.readErrors += 1;
    logger.warn("Firestore reference audit could not list documents", {
      collectionPath: collectionRef.path,
      message: safeErrorMessage(error),
    });
    return;
  }

  for (const documentRef of documentRefs) {
    await scanDocument(documentRef, depth, state);
    if (state.scanLimitReached) return;
  }
}

export const auditFirebaseProjectReferences = onSchedule({
  // Keep this scheduler paused. Run it manually with Force run when diagnosing Firestore migrations.
  schedule: FIREBASE_PROJECT_REFERENCE_AUDIT_SCHEDULE,
  timeZone: "UTC",
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 540,
  maxInstances: 1,
}, async () => {
  const db = getFirestore();
  const state: AuditState = {
    scannedDocuments: 0,
    scannedCollections: 0,
    findings: [],
    readErrors: 0,
    scanLimitReached: false,
  };

  const topLevelCollections = await db.listCollections();
  for (const collectionRef of topLevelCollections) {
    if (collectionRef.id === AUDIT_COLLECTION) continue;
    await scanCollection(collectionRef, 0, state);
    if (state.scanLimitReached) break;
  }

  const foreignProjectIds = Array.from(new Set(
    state.findings.flatMap((finding) => finding.referencedProjectId ? [finding.referencedProjectId] : []),
  )).sort();
  const legacyReferenceCount = state.findings.filter(
    (finding) => finding.referencedProjectId === KNOWN_LEGACY_PROJECT_ID || finding.message?.includes(KNOWN_LEGACY_PROJECT_ID),
  ).length;

  const report = {
    schemaVersion: 1,
    targetProjectId: TARGET_PROJECT_ID,
    knownLegacyProjectId: KNOWN_LEGACY_PROJECT_ID,
    scannedDocuments: state.scannedDocuments,
    scannedCollections: state.scannedCollections,
    findingCount: state.findings.length,
    legacyReferenceCount,
    foreignProjectIds,
    readErrors: state.readErrors,
    scanLimitReached: state.scanLimitReached,
    maxDocumentsPerRun: FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_DOCUMENTS,
    maxFindingsPerRun: FIREBASE_PROJECT_REFERENCE_AUDIT_MAX_FINDINGS,
    findings: state.findings,
    completedAt: FieldValue.serverTimestamp(),
  };

  await db.collection(AUDIT_COLLECTION).doc(AUDIT_DOCUMENT).set(report);
  logger.info("Firestore project reference audit completed", {
    targetProjectId: TARGET_PROJECT_ID,
    scannedDocuments: state.scannedDocuments,
    scannedCollections: state.scannedCollections,
    findingCount: state.findings.length,
    legacyReferenceCount,
    foreignProjectIds,
    readErrors: state.readErrors,
    scanLimitReached: state.scanLimitReached,
  });
});
