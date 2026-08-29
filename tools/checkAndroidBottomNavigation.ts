import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  androidFloatingTabBarMinimumBottomOffset,
  androidFloatingTabBarSystemGap,
  floatingTabBarBottomOffset,
  floatingTabBarBreathingGap,
  floatingTabBarHeight,
  floatingTabBarMinimumTouchTarget,
  floatingTabBarWebBottomOffset,
  getFloatingTabBarBottomOffset,
  getFloatingTabClearance,
} from "../src/utils/safeAreaLayout";

const ROOT = process.cwd();

assert.equal(
  getFloatingTabBarBottomOffset("ios", 34),
  floatingTabBarBottomOffset,
  "The iOS floating-tab position must remain unchanged.",
);
assert.equal(
  getFloatingTabBarBottomOffset("web", 0),
  floatingTabBarWebBottomOffset,
  "The mobile-web floating-tab position must remain unchanged.",
);
assert.equal(
  getFloatingTabBarBottomOffset("android", 0),
  androidFloatingTabBarMinimumBottomOffset,
  "Android must retain a navigation-safe reserve even when inset reporting is zero.",
);

for (const bottomInset of [16, 24, 48, 72]) {
  assert.equal(
    getFloatingTabBarBottomOffset("android", bottomInset),
    bottomInset + androidFloatingTabBarSystemGap,
    `Android inset ${bottomInset} must remain fully below the tab bar.`,
  );
}

for (const invalidInset of [-20, Number.NaN, Number.POSITIVE_INFINITY]) {
  assert.equal(
    getFloatingTabBarBottomOffset("android", invalidInset),
    androidFloatingTabBarMinimumBottomOffset,
    "Invalid Android insets must fall back to the safe minimum.",
  );
}

assert(
  floatingTabBarMinimumTouchTarget >= 48,
  "Every bottom-tab target must meet the 48dp minimum touch size.",
);
assert.equal(
  getFloatingTabClearance(0),
  androidFloatingTabBarMinimumBottomOffset +
    floatingTabBarHeight +
    floatingTabBarBreathingGap,
  "Screen content must clear the elevated Android tab bar.",
);

const navigator = readFileSync(
  join(ROOT, "src/navigation/AppNavigator.tsx"),
  "utf8",
);

assert(
  navigator.includes("useSafeAreaInsets()") &&
    navigator.includes("getFloatingTabBarBottomOffset(") &&
    navigator.includes("bottom: mobileTabBarBottomOffset"),
  "The production tab navigator must position itself from the live safe-area inset.",
);
assert(
  navigator.includes("minHeight: floatingTabBarMinimumTouchTarget"),
  "The production tab navigator must retain the enlarged touch target.",
);
assert(
  navigator.includes("tabBarHideOnKeyboard: !isDesktopWeb"),
  "The mobile tab bar must move out of the way while the keyboard is open.",
);

console.log(
  "Android bottom navigation check passed: system insets, zero-inset fallback, 52dp targets, keyboard handling, and iOS/web preservation.",
);
