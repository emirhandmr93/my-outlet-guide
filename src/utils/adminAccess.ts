import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/config";

export const ADMIN_USERS_COLLECTION = "adminUsers";
export type AdminRole = "admin" | "moderator";
export type AdminAccess = { active: boolean; role: AdminRole | null };

export function isActiveAdminRole(value: unknown): value is AdminRole {
  return value === "admin" || value === "moderator";
}

export async function getAdminAccess(uid?: string | null): Promise<AdminAccess> {
  if (!uid) return { active: false, role: null };
  const snapshot = await getDoc(doc(db, ADMIN_USERS_COLLECTION, uid));
  if (!snapshot.exists()) return { active: false, role: null };
  const data = snapshot.data();
  const role = isActiveAdminRole(data.role) ? data.role : null;
  return { active: data.active === true && Boolean(role), role };
}

export function canUseModeration(access: AdminAccess) {
  return access.active && Boolean(access.role);
}
