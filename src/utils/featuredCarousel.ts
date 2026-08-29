export const MAX_FEATURED_CAROUSEL_DOTS = 9;

export function normalizeFeaturedCarouselIndex(
  index: number,
  itemCount: number,
): number {
  if (
    !Number.isFinite(index) ||
    !Number.isInteger(index) ||
    !Number.isInteger(itemCount) ||
    itemCount <= 0
  ) {
    return 0;
  }
  return index >= 0 && index < itemCount ? index : 0;
}

export function getNextFeaturedCarouselIndex(
  index: number,
  itemCount: number,
): number {
  if (itemCount <= 0) return 0;
  return (normalizeFeaturedCarouselIndex(index, itemCount) + 1) % itemCount;
}

export function shouldUseCompactCarouselIndicator(itemCount: number): boolean {
  return itemCount > MAX_FEATURED_CAROUSEL_DOTS;
}

export function formatFeaturedCarouselPosition(
  index: number,
  itemCount: number,
  locale = "en",
): string {
  const total =
    Number.isFinite(itemCount) && itemCount > 0 ? Math.trunc(itemCount) : 0;
  const current =
    total > 0 ? normalizeFeaturedCarouselIndex(index, total) + 1 : 0;
  try {
    const formatter = new Intl.NumberFormat(locale, { useGrouping: false });
    return `${formatter.format(current)} / ${formatter.format(total)}`;
  } catch {
    return `${current} / ${total}`;
  }
}
