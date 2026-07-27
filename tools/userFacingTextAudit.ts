import ts from "typescript";

const DEBUG_LOCALE_PREFIX =
  /(?:^|\n)\s*(?:(?:TR|EN|DE|FR|IT|ES|AR|RU|ZH):|Türkçe çeviri|çeviri:|translation:)/i;

export function hasDebugLocalePrefix(value: string) {
  return DEBUG_LOCALE_PREFIX.test(value);
}

export function extractUserFacingTextCandidates(
  source: string,
  fileName = "user-facing-audit.tsx",
) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const candidates: string[] = [];

  function isModuleSpecifier(node: ts.StringLiteral) {
    const parent = node.parent;
    return (
      (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
      parent.moduleSpecifier === node
    );
  }

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      candidates.push(node.getText(sourceFile));
    } else if (ts.isStringLiteral(node) && !isModuleSpecifier(node)) {
      candidates.push(node.text);
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      candidates.push(node.text);
    } else if (ts.isTemplateExpression(node)) {
      candidates.push(node.head.text);
      candidates.push(...node.templateSpans.map((span) => span.literal.text));
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return candidates;
}
