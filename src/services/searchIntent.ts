export type SearchIntent =
  | "outlet"
  | "brand"
  | "city"
  | "country"
  | "category"
  | "tool"
  | "guide"
  | "general";

export function detectSearchIntent(tokens: string[]): SearchIntent {
  const query = tokens.join(" ");

  if (query.includes("tax") || query.includes("vat") || query.includes("refund")) {
    return "guide";
  }

  if (
    query.includes("calculator") ||
    query.includes("compare") ||
    query.includes("saving") ||
    query.includes("savings")
  ) {
    return "tool";
  }

  if (query.includes("flight") || query.includes("ticket")) {
    return "tool";
  }

  return "general";
}
