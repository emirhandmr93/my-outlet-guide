import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "App.tsx"), "utf8");
const enhancer = fs.readFileSync(path.join(root, "src/components/WebHorizontalScrollEnhancer.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "src/screens/HomeScreen.tsx"), "utf8");
const outletHero = fs.readFileSync(path.join(root, "src/components/OutletHero.tsx"), "utf8");

assert(
  app.includes('import { WebHorizontalScrollEnhancer } from "./src/components/WebHorizontalScrollEnhancer"') &&
    app.includes("<WebHorizontalScrollEnhancer>") &&
    app.includes("<AppNavigator />"),
  "Web horizontal scroll enhancer is not wrapping app navigation.",
);

assert(
  enhancer.includes('Platform.OS !== "web"'),
  "Manual horizontal scrolling must remain web-only so native swipe behavior is untouched.",
);
assert(
  enhancer.includes("scrollWidth > clientWidth + OVERFLOW_TOLERANCE_PX") &&
    enhancer.includes('overflowX === "auto" || overflowX === "scroll"'),
  "Web enhancer must only capture genuinely horizontally scrollable containers.",
);
assert(
  enhancer.includes('document.addEventListener("pointerdown"') &&
    enhancer.includes('document.addEventListener("pointermove"') &&
    enhancer.includes('document.addEventListener("pointerup"') &&
    enhancer.includes("activeScroller.scrollLeft = startScrollLeft - deltaX"),
  "Mouse drag-to-scroll interaction is incomplete.",
);
assert(
  enhancer.includes("DRAG_THRESHOLD_PX") &&
    enhancer.includes("suppressNextClick") &&
    enhancer.includes('document.addEventListener("click", handleClickCapture, true)'),
  "Drag threshold/click suppression is required so carousel dragging does not accidentally open a card.",
);
assert(
  home.includes("<FlatList<FeaturedSlide>") &&
    home.includes("horizontal") &&
    home.includes('snapToInterval={Platform.OS === "web" ? undefined : carouselWidth}'),
  "Home featured carousel or its native swipe/snap behavior changed unexpectedly.",
);
assert(
  outletHero.includes("data={activeCampaigns}") &&
    outletHero.includes("horizontal") &&
    outletHero.includes('navigation.navigate("CampaignDetail"'),
  "Outlet campaign carousel must remain horizontally swipeable and open campaign details.",
);

console.log("Web manual carousel controls passed: mouse drag is enabled globally on web while native swipe behavior remains unchanged.");
