import { onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { outlets } from "../constants/outlets";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { taxFreeRules, getTaxFreeRule } from "../constants/taxFreeRules";
import { calculateTaxFreeEstimate, isBelowMinimumPurchase, parsePurchaseAmount } from "../services/taxFreeCalculatorService";

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
const route = (path: string) => path.endsWith("/") ? path : `${path}/`;
let currentUser: User | null = null;

function loginUrl() { return `/login/?returnTo=${encodeURIComponent(location.pathname + location.search)}`; }
function requireAuth() { if (!currentUser) { location.assign(loginUrl()); return false; } return true; }
function outletPath(outlet: any) { return route(`/outlets/${outlet.slug || outlet.outletId}`); }
function format(amount: number, currency: string) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount); }

function initSearch() {
  document.querySelectorAll<HTMLInputElement>("[data-search-input]").forEach(input => {
    const results = $("[data-search-results]", input.parentElement?.parentElement || document);
    const kind = $("[data-search-kind]", input.parentElement?.parentElement || document) as HTMLSelectElement | null;
    const render = () => {
      const q = input.value.trim().toLocaleLowerCase("tr");
      const selected = kind?.value || "all";
      if (!results) return;
      if (!q) { results.innerHTML = ""; return; }
      const matches: { type: string; name: string; href: string; note: string }[] = [];
      if (selected === "all" || selected === "outlet") outlets.filter((o: any) => `${o.name} ${(o.aliases || []).join(" ")}`.toLocaleLowerCase("tr").includes(q)).forEach((o: any) => matches.push({ type: "Outlet", name: o.name, href: outletPath(o), note: "Outlet rehberi" }));
      if (selected === "all" || selected === "city") cities.filter((c: any) => c.cityName.toLocaleLowerCase("tr").includes(q)).forEach((c: any) => matches.push({ type: "Şehir", name: c.cityName, href: route(`/cities/${c.cityId}`), note: "Şehir rehberi" }));
      if (selected === "all" || selected === "country") countries.filter((c: any) => c.countryName.toLocaleLowerCase("tr").includes(q)).forEach((c: any) => matches.push({ type: "Ülke", name: c.countryName, href: route(`/countries/${c.countryId}`), note: c.currency }));
      if (selected === "all" || selected === "brand") outlets.filter((o: any) => (o.brands || []).some((b: string) => b.toLocaleLowerCase("tr").includes(q))).slice(0, 20).forEach((o: any) => matches.push({ type: "Marka", name: o.name, href: outletPath(o), note: (o.brands || []).filter((b: string) => b.toLocaleLowerCase("tr").includes(q)).join(", ") }));
      results.innerHTML = matches.slice(0, 20).map(m => `<a class="search-result" href="${m.href}"><b>${esc(m.name)}</b><span>${m.type} · ${esc(m.note)}</span></a>`).join("") || "<p>Sonuç bulunamadı.</p>";
    };
    input.addEventListener("input", render); kind?.addEventListener("change", render);
  });
}

function initCalculator() {
  document.querySelectorAll<HTMLElement>("[data-calculator]").forEach(root => {
    const country = $("select[name=country]", root) as HTMLSelectElement;
    const amount = $("input[name=amount]", root) as HTMLInputElement;
    const result = $("[data-calculator-result]", root)!;
    const render = () => {
      const rule = getTaxFreeRule(country.value); const value = parsePurchaseAmount(amount.value);
      if (!rule || value === undefined || !Number.isFinite(value) || value <= 0) { result.textContent = value !== undefined ? "Geçerli bir satın alma tutarı girin." : "Tutarı girerek tahmini hesabı görün."; return; }
      const estimate = calculateTaxFreeEstimate(value, rule);
      const minimum = isBelowMinimumPurchase(value, rule) ? `<p class="warning">Bu tutar, kaynaklı minimum alışveriş tutarı olan ${format(rule.minimumPurchaseAmount!, rule.currency)} altında.</p>` : "";
      result.innerHTML = `<strong>Tahmini iade: ${format(estimate.estimatedTaxFreeRefund, rule.currency)}</strong><span>Tahmini iade sonrası maliyet: ${format(estimate.estimatedCostAfterRefund, rule.currency)}</span>${minimum}`;
    };
    country.addEventListener("change", render); amount.addEventListener("input", render); render();
  });
}

function initSavings() {
  document.querySelectorAll<HTMLElement>("[data-savings-calculator]").forEach(root => {
    const country = $("select[name=country]", root) as HTMLSelectElement; const european = $("input[name=european-price]", root) as HTMLInputElement; const local = $("input[name=local-price]", root) as HTMLInputElement; const tax = $("input[name=include-tax-free]", root) as HTMLInputElement; const result = $("[data-savings-result]", root)!;
    const render = () => { const rule = getTaxFreeRule(country.value); const eu = parsePurchaseAmount(european.value); const localPrice = parsePurchaseAmount(local.value); if (!rule || !eu || !localPrice || eu <= 0 || localPrice <= 0) { result.textContent = "Her iki fiyatı girerek karşılaştırın."; return; } const estimate = calculateTaxFreeEstimate(eu, rule); const final = eu - (tax.checked ? estimate.estimatedTaxFreeRefund : 0); const difference = localPrice - final; result.innerHTML = `<strong>${difference >= 0 ? "Tahmini avantaj" : "Tahmini fark"}: ${format(Math.abs(difference), rule.currency)}</strong><span>Yurt dışı tahmini maliyet: ${format(final, rule.currency)}. Döviz dönüşümü gösterilmez; canlı kur kullanılmadan farklı para birimleri karşılaştırılamaz.</span>`; };
    [country, european, local, tax].forEach(el => el.addEventListener("input", render)); render();
  });
}

function initAuth() {
  const form = $("[data-auth-form]") as HTMLFormElement | null; const message = $("[data-auth-message]");
  form?.addEventListener("submit", async event => { event.preventDefault(); const data = new FormData(form); const email = String(data.get("email") || ""); const password = String(data.get("password") || ""); const mode = String(data.get("mode") || "login"); try { if (mode === "register") await createUserWithEmailAndPassword(auth, email, password); else await signInWithEmailAndPassword(auth, email, password); location.assign(new URLSearchParams(location.search).get("returnTo") || "/"); } catch (error: any) { if (message) message.textContent = error.message || "Giriş yapılamadı."; } });
  $("[data-password-reset]")?.addEventListener("click", async () => { const email = (form ? new FormData(form).get("email") : "") as string; if (!email) { if (message) message.textContent = "Önce e-posta adresinizi girin."; return; } try { await sendPasswordResetEmail(auth, email); if (message) message.textContent = "Parola sıfırlama e-postası gönderildi."; } catch (error: any) { if (message) message.textContent = error.message; } });
  $("[data-logout]")?.addEventListener("click", () => signOut(auth));
}

function initOutletActions() {
  const outletRoot = $("[data-outlet-id]") as HTMLElement | null; const outletId = outletRoot?.dataset.outletId; if (!outletId) return;
  const favorite = $("[data-favorite]") as HTMLButtonElement | null;
  const syncFavorite = async () => { if (!currentUser || !favorite) return; const snap = await getDoc(doc(db, "favorites", currentUser.uid)); const ids = Array.isArray(snap.data()?.outletIds) ? snap.data()!.outletIds : []; favorite.textContent = ids.includes(outletId) ? "♥ Favoriden çıkar" : "♡ Favori"; };
  favorite?.addEventListener("click", async () => { if (!requireAuth()) return; const ref = doc(db, "favorites", currentUser!.uid); const snap = await getDoc(ref); const ids = Array.isArray(snap.data()?.outletIds) ? snap.data()!.outletIds : []; const next = ids.includes(outletId) ? ids.filter((id: string) => id !== outletId) : [...ids, outletId]; await setDoc(ref, { outletIds: next, updatedAt: new Date().toISOString(), firestoreUpdatedAt: serverTimestamp() }, { merge: true }); await syncFavorite(); });
  $("[data-trip-form]")?.addEventListener("submit", async event => { event.preventDefault(); if (!requireAuth()) return; const data = new FormData(event.currentTarget as HTMLFormElement); const outlet = outlets.find((item: any) => item.outletId === outletId || item.slug === outletRoot?.dataset.outletSlug) as any; const ref = doc(collection(db, "userTrips", currentUser!.uid, "items")); const startDate = String(data.get("startDate")); const endDate = String(data.get("endDate")); await setDoc(ref, { tripId: ref.id, userId: currentUser!.uid, tripName: String(data.get("tripName")), outletId, outletName: outlet?.name || outletId, destination: outlet?.name || "", country: outlet?.countryId || "", city: outlet?.cityId || "", visitDate: startDate, startDate, endDate, notes: String(data.get("notes") || ""), segments: [{ id: "segment-1", outletId, outletName: outlet?.name || outletId, cityId: outlet?.cityId, countryCode: outlet?.countryId, startDate, endDate }], status: "upcoming", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), firestoreCreatedAt: serverTimestamp(), firestoreUpdatedAt: serverTimestamp() }); alert("Seyahat kaydedildi."); });
  const reviews = $("[data-reviews]");
  const loadReviews = async () => { if (!reviews) return; const snap = await getDocs(collection(db, "reviews", outletId, "items")); reviews.innerHTML = snap.docs.map(item => item.data()).filter((r: any) => r.status === "published" && !r.deletedAt).map((r: any) => `<article class="review"><b>${esc(r.userDisplayName || "Misafir")}</b><span>${"★".repeat(Number(r.rating) || 0)} ${esc(r.comment || "")}</span></article>`).join("") || "<p>Henüz yayınlanmış yorum yok.</p>"; };
  $("[data-review-form]")?.addEventListener("submit", async event => { event.preventDefault(); if (!requireAuth()) return; const data = new FormData(event.currentTarget as HTMLFormElement); const rating = Number(data.get("rating")); const comment = String(data.get("comment") || "").trim(); if (!comment || comment.length > 1000 || rating < 1 || rating > 5) { alert("1-5 puan ve en fazla 1000 karakter yorum girin."); return; } await setDoc(doc(db, "reviews", outletId, "items", currentUser!.uid), { reviewId: currentUser!.uid, outletId, userId: currentUser!.uid, userDisplayName: currentUser!.displayName || currentUser!.email?.split("@")[0] || "Misafir", rating, overallRating: rating, title: "", comment, status: "published", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true }); await loadReviews(); });
  loadReviews(); onAuthStateChanged(auth, syncFavorite);
}

function initTrips() { const root = $("[data-user-trips]"); if (!root) return; onAuthStateChanged(auth, user => { if (!user) { root.innerHTML = `<p>Seyahatlerinizi görmek için <a href="${loginUrl()}">giriş yapın</a>.</p>`; return; } onSnapshot(collection(db, "userTrips", user.uid, "items"), snap => root.innerHTML = snap.docs.map(d => { const t: any = d.data(); return `<article class="card"><h3>${esc(t.tripName)}</h3><p>${esc(t.startDate)} – ${esc(t.endDate)} · ${esc(t.outletName || t.destination)}</p><p>${esc(t.notes || "")}</p></article>`; }).join("") || "<p>Henüz kaydedilmiş seyahatiniz yok.</p>"); }); }

onAuthStateChanged(auth, user => { currentUser = user; document.querySelectorAll<HTMLElement>("[data-auth-state]").forEach(node => node.innerHTML = user ? `<span>${esc(user.email || "Hesabım")}</span> <button type="button" data-logout>Çıkış yap</button>` : `<a href="${loginUrl()}">Giriş yap / Kayıt ol</a>`); initAuth(); });
initSearch(); initCalculator(); initSavings(); initAuth(); initOutletActions(); initTrips();
