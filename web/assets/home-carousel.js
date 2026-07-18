(() => {
  const mobileQuery = window.matchMedia("(max-width: 720px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rails = Array.from(document.querySelectorAll('[data-carousel="featured"], [data-carousel="recommended"], [data-carousel="cities"]'));
  const intervalMs = 4000;
  const resumeDelayMs = 5000;

  if (!rails.length) return;

  const getItems = (rail) => Array.from(rail.children).filter((item) => item instanceof HTMLElement);
  const nearestIndex = (rail, items) => {
    const left = rail.scrollLeft;
    return items.reduce((best, item, index) => {
      const distance = Math.abs(item.offsetLeft - left);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  };

  const createController = (rail, offset) => {
    const section = rail.closest(".app-section");
    const dots = Array.from(section?.querySelectorAll("[data-carousel-dot]") || []);
    const items = getItems(rail);
    let timer = 0;
    let resumeTimer = 0;
    let active = 0;
    let inView = false;

    const isEnabled = () => mobileQuery.matches && !reducedMotionQuery.matches && document.visibilityState === "visible";
    const updateDots = (index) => {
      active = index;
      dots.forEach((dot, dotIndex) => {
        const current = dotIndex === active;
        dot.toggleAttribute("aria-current", current);
        dot.classList.toggle("is-active", current);
      });
    };
    const stop = () => {
      window.clearTimeout(timer);
      timer = 0;
    };
    const schedule = (delay = intervalMs + offset) => {
      stop();
      if (!isEnabled() || !inView || items.length < 2) return;
      timer = window.setTimeout(() => {
        const next = (nearestIndex(rail, items) + 1) % items.length;
        rail.scrollTo({ left: items[next].offsetLeft, behavior: "smooth" });
        updateDots(next);
        schedule(intervalMs);
      }, delay);
    };
    const pause = () => {
      stop();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => schedule(intervalMs), resumeDelayMs);
    };
    const sync = () => updateDots(nearestIndex(rail, items));

    rail.addEventListener("scroll", () => { sync(); pause(); }, { passive: true });
    ["touchstart", "pointerdown", "mouseenter", "focusin"].forEach((event) => rail.addEventListener(event, pause, { passive: true }));
    ["mouseleave", "focusout"].forEach((event) => rail.addEventListener(event, () => schedule(resumeDelayMs), { passive: true }));

    updateDots(0);
    return {
      setInView(value) {
        inView = value;
        value ? schedule(intervalMs + offset) : stop();
      },
      refresh() {
        sync();
        schedule();
      },
      stop,
    };
  };

  const controllers = rails.map((rail, index) => createController(rail, index * 300));
  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        const index = rails.indexOf(entry.target);
        controllers[index]?.setInView(entry.isIntersecting);
      }), { threshold: 0.35 })
    : null;

  rails.forEach((rail, index) => observer ? observer.observe(rail) : controllers[index].setInView(true));
  [mobileQuery, reducedMotionQuery].forEach((query) => query.addEventListener("change", () => controllers.forEach((controller) => controller.refresh())));
  document.addEventListener("visibilitychange", () => controllers.forEach((controller) => document.visibilityState === "hidden" ? controller.stop() : controller.refresh()));
})();
