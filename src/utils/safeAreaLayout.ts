export const floatingTabBarHeight = 76;
export const floatingTabBarBottomOffset = 18;
export const floatingTabBarBreathingGap = 28;

export function getScreenTopInset(topInset: number) {
  return topInset + 16;
}

export function getFloatingTabClearance(bottomInset: number) {
  return (
    bottomInset +
    floatingTabBarBottomOffset +
    floatingTabBarHeight +
    floatingTabBarBreathingGap
  );
}

export function getScrollIndicatorBottomInset(bottomInset: number) {
  return bottomInset + floatingTabBarBottomOffset + floatingTabBarHeight;
}
