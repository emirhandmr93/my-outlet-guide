(() => {
  const doc = document;
  const body = doc.body;
  const normalize = (value) => String(value || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
  const labels = { outlet: "OUTLET", city: "ŞEHİR", country: "ÜLKE", brand: "MARKA" };
  let index = [];
  let activeTypes = new Set();
  let lastFocused = null;

  const lock = (value) => body.classList.toggle("is-modal-open", value);
  const openPanel = (selector, focusSelector) => {
    const panel = doc.querySelector(selector);
    if (!panel) return;
    lastFocused = doc.activeElement;
    panel.hidden = false;
    panel.classList.add("is-open");
    lock(true);
    window.setTimeout(() => panel.querySelector(focusSelector)?.focus(), 30);
  };
  const closePanels = () => {
    doc.querySelectorAll("[data-menu-overlay], [data-search-overlay]").forEach((panel) => { panel.classList.remove("is-open"); panel.hidden = true; });
    lock(false);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  doc.addEventListener("click", (event) => {
    const menuOpen = event.target.closest("[data-menu-open]");
    const searchOpen = event.target.closest("[data-search-open]");
    const close = event.target.closest("[data-menu-close], [data-search-close]");
    const chip = event.target.closest("[data-search-chip]");
    const type = event.target.closest("[data-search-type]");
    if (menuOpen) { event.preventDefault(); openPanel("[data-menu-overlay]", "[data-menu-close]"); }
    if (searchOpen) { event.preventDefault(); openPanel("[data-search-overlay]", "[data-search-input]"); renderAllSearch(event.target.dataset.searchPrefill || ""); }
    if (close) { event.preventDefault(); closePanels(); }
    if (chip) { event.preventDefault(); setQuery(chip.dataset.searchChip || chip.textContent || ""); }
    if (type) { event.preventDefault(); const value = type.dataset.searchType; activeTypes.has(value) ? activeTypes.delete(value) : activeTypes.add(value); type.classList.toggle("is-active", activeTypes.has(value)); renderAllSearch(currentQuery()); }
  });
  doc.addEventListener("keydown", (event) => { if (event.key === "Escape") closePanels(); });
  doc.addEventListener("input", (event) => { if (event.target.matches("[data-search-input]")) renderAllSearch(event.target.value); });

  const currentQuery = () => doc.querySelector("[data-inline-search]")?.value || doc.querySelector(".app-search-overlay [data-search-input]")?.value || "";
  const setQuery = (query) => { doc.querySelectorAll("[data-search-input]").forEach((input) => { input.value = query; }); renderAllSearch(query); doc.querySelector("[data-inline-search]")?.focus(); };
  const loadIndex = async () => {
    if (index.length) return index;
    try { index = await fetch("/assets/search-index.json", { cache: "force-cache" }).then((r) => r.json()); } catch { index = []; }
    return index;
  };
  const resultHtml = (items) => items.length ? items.map((item) => `<a class="app-result-card app-search-result-card" href="${item.href}"><b>${labels[item.type] || item.type}</b><span>${item.title}<small>${item.subtitle || ""}</small></span><i>→</i></a>`).join("") : `<div class="app-empty-state"><h3>Sonuç bulunamadı</h3><p>Farklı bir şehir, outlet veya marka adı deneyin.</p></div>`;
  const search = async (query) => {
    const q = normalize(query);
    const data = await loadIndex();
    if (!q) return [];
    return data.filter((item) => (!activeTypes.size || activeTypes.has(item.type)) && normalize([item.title, item.subtitle, ...(item.keywords || [])].join(" ")).includes(q)).slice(0, 24);
  };
  async function renderAllSearch(query) {
    const hasQuery = Boolean(String(query || "").trim());
    doc.querySelectorAll("[data-default-discovery]").forEach((el) => { el.hidden = hasQuery; });
    doc.querySelectorAll("[data-search-section]").forEach((el) => { el.hidden = !hasQuery; });
    const items = await search(query);
    doc.querySelectorAll("[data-search-results]").forEach((el) => { el.innerHTML = hasQuery ? resultHtml(items) : ""; });
  }

  const path = location.pathname.replace(/\/index\.html$/, "/");
  const section = path === "/" ? "home" : path.startsWith("/trip-planner/") || path.startsWith("/flight-deals/") ? "trip" : path.startsWith("/savings/") || path.startsWith("/tax-free/") ? "savings" : path.startsWith("/app/") ? "profile" : path.startsWith("/explore/") || path.startsWith("/outlets/") || path.startsWith("/cities/") || path.startsWith("/countries/") || path.startsWith("/brands/") ? "explore" : "";
  doc.querySelectorAll(".app-bottom-tabs a").forEach((a) => { const href = a.getAttribute("href") || ""; const match = (section === "home" && href === "/") || (section === "explore" && href === "/explore/") || (section === "trip" && href === "/trip-planner/") || (section === "savings" && href === "/savings/") || (section === "profile" && href === "/app/"); a.classList.toggle("is-active", match); if (match) a.setAttribute("aria-current", "page"); });
  doc.querySelectorAll(".links a").forEach((a) => { const href = a.getAttribute("href") || ""; const exact = path === href; const grouped = section === "explore" && (href === "/explore/" || (path.startsWith("/outlets/") && href === "/outlets/")); a.classList.toggle("is-active", exact || grouped); });

  const mobileQuery = window.matchMedia("(max-width: 720px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rails = Array.from(doc.querySelectorAll('[data-carousel="featured"], [data-carousel="recommended"], [data-carousel="cities"]'));
  rails.forEach((rail) => { rail.addEventListener("scroll", () => { const items = Array.from(rail.children); const idx = items.reduce((best, item, i) => Math.abs(item.offsetLeft - rail.scrollLeft) < best.d ? { i, d: Math.abs(item.offsetLeft - rail.scrollLeft) } : best, { i: 0, d: Infinity }).i; rail.closest(".app-section")?.querySelectorAll("[data-carousel-dot]").forEach((dot, i) => dot.toggleAttribute("aria-current", i === idx)); }, { passive: true }); });
})();
