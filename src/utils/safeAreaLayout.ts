export const floatingTabBarHeight = 76;
export const floatingTabBarBottomOffset = 18;
export const floatingTabBarBreathingGap = 44;

export function getScreenTopInset(topInset: number) {
  return topInset + 24;
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
  return (
    bottomInset +
    floatingTabBarBottomOffset +
    floatingTabBarHeight +
    floatingTabBarBreathingGap
  );
}
