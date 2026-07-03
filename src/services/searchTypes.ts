export type SearchResultType =
  | "outlet"
  | "brand"
  | "city"
  | "country"
  | "category"
  | "feature";

export type SearchRouteParams = Record<string, string>;

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: SearchResultType;
  routeName: string;
  routeParams?: SearchRouteParams;
  keywords?: string[];
  score: number;
};
