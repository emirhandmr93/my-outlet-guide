export function getRecommendedCarouselLastIndex(
  itemCount: number,
  cardWidth: number,
  gap: number,
  viewportWidth: number,
) {
  if (itemCount <= 1 || cardWidth <= 0 || viewportWidth <= 0) return 0;
  const step = cardWidth + gap;
  const contentWidth = itemCount * cardWidth + Math.max(0, itemCount - 1) * gap;
  return Math.max(0, Math.floor((contentWidth - viewportWidth) / step));
}
