export const floatingTabBarHeight = 76;
export const floatingTabBarBottomOffset = 18;
export const floatingTabBarWebBottomOffset = 12;
export const androidFloatingTabBarMinimumBottomOffset = 24;
export const androidFloatingTabBarSystemGap = 8;
export const floatingTabBarMinimumTouchTarget = 52;
export const floatingTabBarBreathingGap = 44;

function normalizeInset(inset: number) {
  return Number.isFinite(inset) ? Math.max(0, inset) : 0;
}

export function getFloatingTabBarBottomOffset(
  platform: string,
  bottomInset: number,
) {
  if (platform !== "android") {
    return platform === "ios"
      ? floatingTabBarBottomOffset
      : floatingTabBarWebBottomOffset;
  }

  return Math.max(
    androidFloatingTabBarMinimumBottomOffset,
    normalizeInset(bottomInset) + androidFloatingTabBarSystemGap,
  );
}

export function getScreenTopInset(topInset: number) {
  return topInset + 24;
}

export function getFloatingTabClearance(bottomInset: number) {
  return (
    Math.max(
      normalizeInset(bottomInset) + floatingTabBarBottomOffset,
      androidFloatingTabBarMinimumBottomOffset,
    ) +
    floatingTabBarHeight +
    floatingTabBarBreathingGap
  );
}

export function getScrollIndicatorBottomInset(bottomInset: number) {
  return getFloatingTabClearance(bottomInset);
}
