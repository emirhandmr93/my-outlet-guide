import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { outlets } from "../constants/outlets";
import { countries } from "../constants/countries";
import { cities } from "../constants/cities";
import { brands } from "../constants/brands";
import { getBrandCategoryGroupsForOutlet } from "../services/brandService";
import { getRestaurantsForOutlet } from "../services/restaurantService";
import {
  getTransportationV2Options,
  getOutletTransportationV2Summary,
} from "../services/transportationV2Service";
import {
  getExploreHeroImage,
  getHomeFeatureImage,
  getHomeHeroImage,
  getOutletGalleryImages,
  getOutletPrimaryImage,
  getPopularCityImage,
  getRecommendedOutletImage,
  getRecommendedOutlets,
  nativePopularCityIds,
} from "../media/imageResolvers";
import { colors, spacing } from "../theme";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";

const logo = require("../../assets/brand/logo-horizontal.png");
const homeHero = getHomeHeroImage();
const exploreHero = getExploreHeroImage();
type Route =
  | { name: "home" }
  | { name: "explore" }
  | { name: "outlet"; outletId: string }
  | { name: "transport"; outletId: string };
function currentRoute(): Route {
  const p = globalThis.location?.pathname ?? "/";
  const t = p.match(/\/outlets\/([^/]+)\/transport/);
  if (t) return { name: "transport", outletId: t[1] };
  const m = p.match(/\/outlets\/([^/]+)/);
  if (m) return { name: "outlet", outletId: m[1] };
  if (/explore|countries|cities|brands|outlets/.test(p))
    return { name: "explore" };
  return { name: "home" };
}
function go(path: string) {
  history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function outletCount(countryId?: string, cityId?: string) {
  return outlets.filter(
    (o) =>
      (!countryId || o.countryId === countryId) &&
      (!cityId || o.cityId === cityId),
  ).length;
}
function trCountryName(countryId: string) {
  return formatCountryDisplayName(countryId, "tr");
}
function trCityName(cityId: string) {
  return formatCityDisplayName(cityId, "tr");
}
function Shell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "home" | "explore" | "trip" | "savings" | "profile";
}) {
  const tabs = [
    ["home", "Ana Sayfa", "home", "/"],
    ["explore", "Keşfet", "search", "/explore/"],
    ["trip", "Seyahat", "briefcase", "/trip-planner/"],
    ["savings", "Tasarruf", "cash", "/savings/"],
    ["profile", "Profil", "person", "/app/"],
  ] as const;
  return (
    <SafeAreaProvider>
      <View style={s.page}>
        <View style={s.phone}>
          {children}
          <View style={s.tabs}>
            {tabs.map((t) => (
              <TouchableOpacity
                key={t[0]}
                onPress={() => go(t[3])}
                style={s.tab}
              >
                <Ionicons
                  name={
                    (t[2] === "search"
                      ? "search"
                      : t[2] === "person"
                        ? "person-outline"
                        : t[2] === "briefcase"
                          ? "briefcase-outline"
                          : t[2] === "cash"
                            ? "cash-outline"
                            : "home") as any
                  }
                  size={20}
                  color={
                    active === t[0] ? colors.gold : "rgba(255,255,255,.72)"
                  }
                />
                <Text
                  style={[s.tabText, active === t[0] && { color: colors.gold }]}
                >
                  {t[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
function Topbar() {
  return (
    <View style={s.topbar}>
      <TouchableOpacity style={s.iconBtn}>
        <Feather name="menu" size={23} color={colors.primary} />
      </TouchableOpacity>
      <Image source={logo} style={s.logo} resizeMode="contain" />
      <View style={s.topActions}>
        <TouchableOpacity style={s.iconBtn}>
          <Ionicons
            name="notifications-outline"
            size={21}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={s.lang}>🇹🇷 TR</Text>
      </View>
    </View>
  );
}
function Section(p: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  right?: string;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <View>
          <Text style={s.sectionTitle}>{p.title}</Text>
          {p.sub && <Text style={s.sectionSub}>{p.sub}</Text>}
        </View>
        {p.right && <Text style={s.goldText}>{p.right}</Text>}
      </View>
      {p.children}
    </View>
  );
}
function OutletCard({ outlet }: { outlet: any }) {
  const img = getRecommendedOutletImage(outlet);
  return (
    <TouchableOpacity
      style={s.outletCard}
      onPress={() => go(`/outlets/${outlet.outletId}/`)}
    >
      <Image source={img} style={s.cardImg} />
      <Text style={s.typeLabel}>OUTLET</Text>
      <Text style={s.cardTitle}>{outlet.name}</Text>
      <Text style={s.muted}>
        {trCityName(outlet.cityId)}, {trCountryName(outlet.countryId)}
      </Text>
      <Text style={s.goldText}>{outlet.storesCountText}</Text>
    </TouchableOpacity>
  );
}
function Home() {
  const rec = getRecommendedOutlets();
  return (
    <Shell active="home">
      <ScrollView contentContainerStyle={s.content}>
        <Topbar />
        <ImageBackground
          source={homeHero}
          imageStyle={s.heroImg}
          style={s.hero}
        >
          <Text style={s.kicker}>PREMIUM ALIŞVERİŞ VE SEYAHAT ASİSTANI</Text>
          <Text style={s.heroTitle}>My Outlet Guide’a hoş geldin</Text>
          <Text style={s.heroSub}>
            Premium outletleri keşfet, daha çok tasarruf et ve sonraki alışveriş
            seyahatini planla.
          </Text>
        </ImageBackground>
        <TouchableOpacity onPress={() => go("/explore/")} style={s.searchPill}>
          <Feather name="search" size={18} color={colors.primary} />
          <Text style={s.searchText}>Şehir, outlet ve marka ara</Text>
        </TouchableOpacity>
        <Section
          title="Öne çıkanlar"
          sub="Outlet keşfi, seyahat planı, tasarruf ve çevrimdışı erişim."
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {([
              ["discover-outlets", "🛍️", "Outletleri keşfet"],
              ["plan-trip", "✈️", "Outlet seyahatini planla"],
              ["savings-guide", "₺", "Tasarruf araçları"],
              ["offline-availability", "↓", "Çevrimdışı rehber"],
            ] as const).map(([imageKey, icon, label]) => (
              <ImageBackground
                key={imageKey}
                source={getHomeFeatureImage(imageKey)}
                imageStyle={s.featureImage}
                style={s.feature}
              >
                <Text style={s.featureIcon}>{icon}</Text>
                <Text style={s.cardTitle}>{label}</Text>
                <Text style={s.muted}>Uygulama ritminde hızlı erişim.</Text>
              </ImageBackground>
            ))}
          </ScrollView>
        </Section>
        <Section title="Önerilen outletler">
          {" "}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {rec.map((o: any) => (
              <OutletCard key={o.outletId} outlet={o} />
            ))}
          </ScrollView>
        </Section>
        <Section title="Aktiviteniz">
          <View style={s.activity}>
            <Text style={s.cardTitle}>Henüz seyahat yok</Text>
            <Text style={s.muted}>
              Favoriler ve seyahat kartları uygulamadaki gibi burada özetlenir.
            </Text>
          </View>
        </Section>
        <Section title="Alışveriş araçları">
          <View style={s.grid}>
            {[
              "Tax Free Hesaplayıcı",
              "Döviz Çevirici",
              "Uçuş Alarmı",
              "Çevrimdışı",
            ].map((x) => (
              <View key={x} style={s.tool}>
                <Text style={s.toolIcon}>%</Text>
                <Text style={s.cardTitle}>{x}</Text>
              </View>
            ))}
          </View>
        </Section>
        <Section title="Popüler şehirler">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nativePopularCityIds.map((id) => (
              <View key={id} style={s.city}>
                <Image source={getPopularCityImage(id)!} style={s.cityImg} />
                <Text style={s.cardTitle}>{trCityName(id)}</Text>
                <Text style={s.muted}>{outletCount(undefined, id)} outlet</Text>
              </View>
            ))}
          </ScrollView>
        </Section>
      </ScrollView>
    </Shell>
  );
}
type Result = {
  key: string;
  type: "ÜLKE" | "ŞEHİR" | "OUTLET" | "MARKA";
  title: string;
  subtitle: string;
  icon: string;
  outletId?: string;
};
function searchResults(q: string): Result[] {
  const n = q.trim().toLowerCase();
  if (!n) return [];
  const bag: Result[] = [];
  countries.forEach((c: any) => {
    const title = trCountryName(c.countryId);
    if (`${c.countryId} ${c.countryName} ${title}`.toLowerCase().includes(n))
      bag.push({
        key: `c-${c.countryId}`,
        type: "ÜLKE",
        title,
        subtitle: `${outletCount(c.countryId)} outlet`,
        icon: c.countryFlag || "🌍",
      });
  });
  cities.forEach((c: any) => {
    const title = trCityName(c.cityId);
    const country = trCountryName(c.countryId);
    if (
      `${c.cityId} ${c.cityName} ${title} ${country}`.toLowerCase().includes(n)
    )
      bag.push({
        key: `ci-${c.cityId}`,
        type: "ŞEHİR",
        title,
        subtitle: `${country} · ${outletCount(c.countryId, c.cityId)} outlet`,
        icon: "📍",
      });
  });
  outlets.forEach((o: any) => {
    if (
      `${o.name} ${o.cityId} ${o.countryId} ${trCityName(o.cityId)} ${trCountryName(o.countryId)}`
        .toLowerCase()
        .includes(n)
    )
      bag.push({
        key: `o-${o.outletId}`,
        type: "OUTLET",
        title: o.name,
        subtitle: `${trCityName(o.cityId)}, ${trCountryName(o.countryId)}`,
        icon: "🛍️",
        outletId: o.outletId,
      });
  });
  brands.forEach((b: any) => {
    if (`${b.brandName} ${b.brandId}`.toLowerCase().includes(n))
      bag.push({
        key: `b-${b.brandId}`,
        type: "MARKA",
        title: b.brandName,
        subtitle: "Marka sonucu",
        icon: "🏷️",
      });
  });
  return bag.slice(0, 24);
}
function ResultRow({ r }: { r: Result }) {
  return (
    <TouchableOpacity
      onPress={() => r.outletId && go(`/outlets/${r.outletId}/`)}
      style={s.row}
    >
      <Text style={s.rowIcon}>{r.icon}</Text>
      <View style={s.rowText}>
        <Text style={s.typeLabel}>{r.type}</Text>
        <Text numberOfLines={1} style={s.cardTitle}>
          {r.title}
        </Text>
        <Text numberOfLines={1} style={s.muted}>
          {r.subtitle}
        </Text>
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}
function Explore() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"country" | "city" | "outlet">("outlet");
  const results = useMemo(() => searchResults(q), [q]);
  const modeRows =
    mode === "country"
      ? countries
          .slice(0, 14)
          .map((c: any) => ({
            key: c.countryId,
            icon: c.countryFlag || "🌍",
            title: trCountryName(c.countryId),
            sub: `${outletCount(c.countryId)} outlet`,
            type: "ÜLKE",
          }))
      : mode === "city"
        ? cities
            .slice(0, 14)
            .map((c: any) => ({
              key: c.cityId,
              icon: "📍",
              title: trCityName(c.cityId),
              sub: `${trCountryName(c.countryId)} · ${outletCount(c.countryId, c.cityId)} outlet`,
              type: "ŞEHİR",
            }))
        : outlets
            .slice(0, 14)
            .map((o: any) => ({
              key: o.outletId,
              icon: "🛍️",
              title: o.name,
              sub: `${trCityName(o.cityId)}, ${trCountryName(o.countryId)}`,
              type: "OUTLET",
              outletId: o.outletId,
            }));
  return (
    <Shell active="explore">
      <ScrollView contentContainerStyle={s.content}>
        <ImageBackground
          source={exploreHero}
          imageStyle={s.heroImg}
          style={s.exploreHero}
        >
          <Text style={s.kicker}>KEŞFET</Text>
          <Text style={s.heroTitle}>Aklındakini bul</Text>
          <Text style={s.heroSub}>
            Ülkeleri, şehirleri, outletleri ve markaları tek premium keşif
            merkezinde ara.
          </Text>
        </ImageBackground>
        <View style={s.inputWrap}>
          <Feather name="search" size={18} color={colors.primary} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Ülke, şehir, outlet, marka ara..."
            style={s.input}
          />
        </View>
        {q ? (
          <Section title="Arama Sonuçları" sub={`${results.length} sonuç`}>
            <>
              {results.map((r) => (
                <ResultRow key={r.key} r={r} />
              ))}
            </>
          </Section>
        ) : (
          <>
            <View style={s.chips}>
              {[
                ["country", "🌍 Ülkeler"],
                ["city", "📍 Şehirler"],
                ["outlet", "🛍️ Outletler"],
              ].map(([k, label]) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setMode(k as any)}
                  style={[s.chip, mode === k && s.chipOn]}
                >
                  <Text style={[s.chipText, mode === k && s.chipTextOn]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Section title="Popüler aramalar">
              <View style={s.chips}>
                {["Paris", "Burberry", "Fransa", "İtalya", "Nike"].map((x) => (
                  <TouchableOpacity
                    key={x}
                    onPress={() => setQ(x)}
                    style={s.pop}
                  >
                    <Text style={s.popText}>{x}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>
            <Section title="Nasıl keşfetmek istersin?">
              <View style={s.discovery}>
                <TouchableOpacity
                  onPress={() => setMode("outlet")}
                  style={[s.discoverCard, s.discoverWide]}
                >
                  <Text style={s.featureIcon}>🛍️</Text>
                  <Text style={s.cardTitle}>Outlet ara</Text>
                  <Text style={s.muted}>
                    Outlet, şehir, ülke veya marka adına göre ara.
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode("country")}
                  style={s.discoverCard}
                >
                  <Text style={s.featureIcon}>🌍</Text>
                  <Text style={s.cardTitle}>Ülkeye göre keşfet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode("city")}
                  style={s.discoverCard}
                >
                  <Text style={s.featureIcon}>📍</Text>
                  <Text style={s.cardTitle}>Şehre göre keşfet</Text>
                </TouchableOpacity>
              </View>
            </Section>
            <Section
              title={
                mode === "country"
                  ? "Ülkeler"
                  : mode === "city"
                    ? "Şehirler"
                    : "Outletler"
              }
            >
              {modeRows.map((r: any) => (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => r.outletId && go(`/outlets/${r.outletId}/`)}
                  style={s.row}
                >
                  <Text style={s.rowIcon}>{r.icon}</Text>
                  <View style={s.rowText}>
                    <Text style={s.typeLabel}>{r.type}</Text>
                    <Text numberOfLines={1} style={s.cardTitle}>
                      {r.title}
                    </Text>
                    <Text numberOfLines={1} style={s.muted}>
                      {r.sub}
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </Section>
            <Section title="Popüler şehirler">
              {nativePopularCityIds.slice(0, 4).map((id) => (
                <View key={id} style={s.cityRow}>
                  <Image
                    source={getPopularCityImage(id)!}
                    style={s.cityRowImg}
                  />
                  <View style={s.rowText}>
                    <Text style={s.cardTitle}>{trCityName(id)}</Text>
                    <Text style={s.muted}>
                      {outletCount(undefined, id)} outlet
                    </Text>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </View>
              ))}
            </Section>
          </>
        )}
      </ScrollView>
    </Shell>
  );
}
function DetailTop({ title, back }: { title: string; back: string }) {
  return (
    <View style={s.detailHead}>
      <TouchableOpacity onPress={() => go(back)}>
        <Text style={s.back}>‹ Geri</Text>
      </TouchableOpacity>
      <Text style={s.detailTitle}>{title}</Text>
      <View style={{ width: 54 }} />
    </View>
  );
}
function Detail({ outletId }: { outletId: string }) {
  const o: any =
    outlets.find((x: any) => x.outletId === outletId) || outlets[0];
  const primaryImage = getOutletPrimaryImage(o);
  const galleryImages = getOutletGalleryImages(o);
  const imgs = primaryImage
    ? [primaryImage, ...galleryImages.filter((image) => image !== primaryImage)]
    : galleryImages;
  const [sel, setSel] = useState(imgs[0]);
  const [allRest, setAllRest] = useState(false);
  const groups = getBrandCategoryGroupsForOutlet(o.outletId);
  const transport = getOutletTransportationV2Summary(o.outletId);
  const rest = getRestaurantsForOutlet(o.outletId);
  const quick = [
    ["🕒", "Saatler", o.openingHours],
    ["🛍️", "Mağazalar", o.storesCountText],
    ["₺", "Tax Free", o.taxFreeAvailable ? "Var" : "Yok"],
    ["✈️", "Havalimanları", `${o.airports?.length || 0}`],
    [
      "📍",
      "Şehir merkezi",
      `${o.cityCenterDistanceKm || o.cityCenterInfo?.distanceKm || "—"} km`,
    ],
    ["★", "Puan", `${o.rating || "—"}`],
  ];
  return (
    <Shell active="explore">
      <ScrollView contentContainerStyle={s.content}>
        <DetailTop title="Outlet" back="/explore/" />
        <ImageBackground
          source={sel}
          imageStyle={s.detailHeroImg}
          style={s.detailHero}
        >
          <Text style={s.kicker}>OUTLET</Text>
          <Text style={s.heroTitle}>{o.name}</Text>
          <Text style={s.heroSub}>
            {trCityName(o.cityId)}, {trCountryName(o.countryId)}
          </Text>
        </ImageBackground>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {imgs.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => setSel(img)}>
              <Image
                source={img}
                style={[s.thumb, img === sel && s.thumbOn]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={s.status}>● Aktif · {o.openingHours}</Text>
        <View style={s.actions}>
          {["♡\nFavori", "✈\nSeyahat Oluştur", "↗\nYol Tarifi"].map((x, i) => (
            <TouchableOpacity
              key={x}
              style={s.action}
              onPress={() =>
                i === 2 && o.googleMapsUrl && Linking.openURL(o.googleMapsUrl)
              }
            >
              <Text style={s.actionText}>{x}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabChips}
        >
          {["Özet", "Markalar", "Ulaşım", "Yemek", "Yorumlar"].map((x, i) => (
            <View key={x} style={[s.chip, i === 0 && s.chipOn]}>
              <Text style={[s.chipText, i === 0 && s.chipTextOn]}>{x}</Text>
            </View>
          ))}
        </ScrollView>
        <Section title="Hızlı Bilgiler">
          <View style={s.grid}>
            {quick.map(([icon, label, value]) => (
              <View style={s.info} key={label}>
                <Text style={s.infoIcon}>{icon}</Text>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>
                  {String(value).replace("Generally ", "")}
                </Text>
              </View>
            ))}
          </View>
        </Section>
        <Section title="Tax Free">
          <View style={s.activity}>
            <Text style={s.cardTitle}>Tax Free</Text>
            <Text style={s.muted}>
              KDV oranı: %{o.vatRate || "—"} · Minimum harcama:{" "}
              {o.minimumTaxFreeSpend || "resmi sağlayıcıdan kontrol edin"}
            </Text>
            <Text style={s.muted}>
              İade uygunluğu mağaza, ürün, ülke ve gümrük onayına bağlıdır;
              garanti iade iddiası içermez.
            </Text>
          </View>
        </Section>
        <Section
          title="Markalar"
          right={`${groups.reduce((a, g) => a + g.brands.length, 0)} marka`}
        >
          <View style={s.inputWrap}>
            <Feather name="search" size={17} color={colors.primary} />
            <Text style={s.searchText}>Marka ara</Text>
          </View>
          {groups.map((g: any) => (
            <View key={g.categoryId} style={s.group}>
              <View style={s.categoryRow}>
                <Text style={s.cardTitle}>
                  {g.icon} {g.categoryName}
                </Text>
                <Text style={s.muted}>{g.brands.length} ›</Text>
              </View>
              <View style={s.chips}>
                {g.brands.slice(0, 18).map((b: any) => (
                  <View style={s.pop} key={b.brandId}>
                    <Text style={s.popText}>{b.brandName}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Section>
        <Section title="Ulaşım">
          <View style={s.activity}>
            {transport.map((t: any) => (
              <View style={s.routeCard} key={t.id}>
                <Text style={s.typeLabel}>
                  {t.originGroup === "airport"
                    ? "Havaalanından"
                    : "Şehir merkezinden"}
                </Text>
                <Text style={s.cardTitle}>{t.modeLabel}</Text>
                <Text style={s.muted}>
                  {t.estimatedDurationLabel} · {t.estimatedFareLabel}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => go(`/outlets/${o.outletId}/transport/`)}
              style={s.button}
            >
              <Text style={s.buttonText}>Ulaşım Rehberini Gör</Text>
            </TouchableOpacity>
          </View>
        </Section>
        <Section title="Haritalar">
          <MapRows o={o} />
        </Section>
        <Section title="Resmi web sitesi">
          <View style={s.row}>
            <Text style={s.rowIcon}>🌐</Text>
            <View style={s.rowText}>
              <Text style={s.cardTitle}>Resmi web sitesi</Text>
              <Text style={s.muted}>
                Saat, etkinlik ve kampanya detaylarını resmi siteden kontrol
                edin.
              </Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </View>
        </Section>
        <Section title="Restoranlar">
          {rest.slice(0, allRest ? rest.length : 3).map((r: any) => (
            <View style={s.row} key={r.restaurantId}>
              <Text style={s.rowIcon}>🍽️</Text>
              <View style={s.rowText}>
                <Text style={s.cardTitle}>{r.restaurantName}</Text>
                <Text style={s.muted}>
                  {r.category} · {r.priceLevel}
                </Text>
              </View>
            </View>
          ))}
          {rest.length > 3 && (
            <TouchableOpacity
              style={s.button}
              onPress={() => setAllRest(!allRest)}
            >
              <Text style={s.buttonText}>
                {allRest ? "Daha az göster" : "Tüm restoranlar"}
              </Text>
            </TouchableOpacity>
          )}
        </Section>
        <Section title="Hizmetler">
          <View style={s.chips}>
            {Array.from(new Set<string>((o.services ?? []).map(String))).map(
              (x) => (
                <View style={s.pop} key={x}>
                  <Text style={s.popText}>{x}</Text>
                </View>
              ),
            )}
          </View>
        </Section>
      </ScrollView>
    </Shell>
  );
}
function MapRows({ o }: { o: any }) {
  return (
    <View>
      <TouchableOpacity
        onPress={() => o.googleMapsUrl && Linking.openURL(o.googleMapsUrl)}
        style={[s.row, s.mapMain]}
      >
        <Text style={s.rowIcon}>🗺️</Text>
        <View style={s.rowText}>
          <Text style={[s.cardTitle, { color: "white" }]}>
            Google Maps önerilir
          </Text>
          <Text style={[s.muted, { color: "rgba(255,255,255,.75)" }]}>
            Navigasyonu Google Maps ile aç
          </Text>
        </View>
        <Text style={[s.arrow, { color: colors.gold }]}>›</Text>
      </TouchableOpacity>
      {[
        ["Apple Maps", o.appleMapsUrl],
        ["Yandex Maps", o.yandexMapsUrl],
      ].map(([title, url]) => (
        <TouchableOpacity
          key={title}
          onPress={() => url && Linking.openURL(String(url))}
          style={s.row}
        >
          <Text style={s.rowIcon}>⌖</Text>
          <View style={s.rowText}>
            <Text style={s.cardTitle}>{title}</Text>
            <Text style={s.muted}>Alternatif harita uygulaması</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function Transport({ outletId }: { outletId: string }) {
  const o: any =
    outlets.find((x: any) => x.outletId === outletId) || outlets[0];
  const options = getTransportationV2Options(o.outletId).slice(0, 8);
  return (
    <Shell active="trip">
      <ScrollView contentContainerStyle={s.content}>
        <DetailTop title="Ulaşım" back={`/outlets/${o.outletId}/`} />
        <Text style={s.transportTitle}>Ulaşım</Text>
        <Text style={s.goldText}>
          Önerilen rota ve tahmini ulaşım seçenekleri
        </Text>
        <View style={s.activity}>
          <Text style={s.typeLabel}>ÖNERİLEN ROTA</Text>
          <Text style={s.cardTitle}>
            {options[0]?.title || "Şehir merkezinden"}
          </Text>
          <Text style={s.muted}>
            {options[0]?.estimatedDurationLabel} ·{" "}
            {options[0]?.estimatedFareLabel}
          </Text>
        </View>
        <Section title="Havaalanından">
          {options
            .filter((x: any) => x.originGroup === "airport")
            .map((t: any) => (
              <TransportRow key={t.id} t={t} />
            ))}
        </Section>
        <Section title="Şehir merkezinden">
          {options
            .filter((x: any) => x.originGroup !== "airport")
            .map((t: any) => (
              <TransportRow key={t.id} t={t} />
            ))}
        </Section>
        <Section title="Adım adım rehber">
          {(options[0]?.steps || []).map((step: string, i: number) => (
            <View style={s.row} key={step}>
              <Text style={s.rowIcon}>{i + 1}</Text>
              <Text style={[s.cardTitle, s.rowText]}>{step}</Text>
            </View>
          ))}
        </Section>
        <MapRows o={o} />
      </ScrollView>
    </Shell>
  );
}
function TransportRow({ t }: { t: any }) {
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>🚌</Text>
      <View style={s.rowText}>
        <Text style={s.cardTitle}>{t.title}</Text>
        <Text style={s.muted}>
          {t.modeLabel} · {t.estimatedDurationLabel} · {t.estimatedFareLabel}
        </Text>
      </View>
      <Text style={s.arrow}>›</Text>
    </View>
  );
}
export default function WebPocApp() {
  const [route, setRoute] = useState(currentRoute());
  useMemo(() => {
    const l = () => setRoute(currentRoute());
    addEventListener("popstate", l);
    return () => removeEventListener("popstate", l);
  }, []);
  if (route.name === "explore") return <Explore />;
  if (route.name === "outlet") return <Detail outletId={route.outletId} />;
  if (route.name === "transport")
    return <Transport outletId={route.outletId} />;
  return <Home />;
}
const s = StyleSheet.create({
  page: {
    minHeight: "100%" as any,
    backgroundColor: "#d9e2ec",
    alignItems: "center",
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    minHeight: "100%" as any,
    backgroundColor: "#F7F4EC",
    overflow: "hidden",
  },
  content: { padding: spacing.lg, paddingBottom: 132 },
  topbar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 156, height: 38 },
  topActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  lang: {
    fontWeight: "900",
    color: colors.primary,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  hero: {
    height: 250,
    borderRadius: 30,
    overflow: "hidden",
    padding: 22,
    justifyContent: "flex-end",
    backgroundColor: colors.primary,
  },
  exploreHero: {
    height: 190,
    borderRadius: 30,
    overflow: "hidden",
    padding: 22,
    justifyContent: "flex-end",
    backgroundColor: colors.primary,
  },
  heroImg: { opacity: 0.76 },
  kicker: {
    color: colors.gold,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "white",
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 34,
  },
  heroSub: { color: "white", fontSize: 14, fontWeight: "700", marginTop: 7 },
  searchPill: {
    marginTop: -25,
    marginHorizontal: 13,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  searchText: { fontWeight: "800", color: colors.primary },
  section: { marginTop: 26 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: colors.primary },
  sectionSub: { color: "#5f6b7a", fontWeight: "600", marginTop: 4 },
  feature: {
    width: 210,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginRight: 12,
    overflow: "hidden",
  },
  featureImage: { borderRadius: 24, opacity: 0.2 },
  featureIcon: { fontSize: 28, color: colors.gold },
  outletCard: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 26,
    padding: 12,
    marginRight: 14,
  },
  cardImg: { height: 145, borderRadius: 20, width: "100%" },
  cardTitle: { fontSize: 15, fontWeight: "900", color: colors.primary },
  muted: { color: "#5f6b7a", fontWeight: "600", marginTop: 4 },
  goldText: { color: colors.gold, fontWeight: "900" },
  typeLabel: {
    color: colors.gold,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  activity: { backgroundColor: "white", borderRadius: 24, padding: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tool: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
  },
  toolIcon: { fontSize: 24, color: colors.gold },
  city: {
    width: 152,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 10,
    marginRight: 12,
  },
  cityImg: { height: 94, borderRadius: 18, width: "100%" },
  tabs: {
    position: "fixed" as any,
    left: 14,
    right: 14,
    bottom: 14,
    height: 76,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    maxWidth: 402,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  tab: { alignItems: "center", flex: 1 },
  tabText: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,.72)",
    marginTop: 3,
  },
  inputWrap: {
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 14,
    minHeight: 54,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    fontWeight: "800",
    outlineStyle: "none" as any,
    minWidth: 0,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tabChips: { gap: 8, paddingTop: 14, paddingRight: 18 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "white",
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontWeight: "900", color: colors.primary, fontSize: 13 },
  chipTextOn: { color: colors.gold },
  pop: {
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  popText: { fontWeight: "800", color: colors.primary },
  row: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    alignItems: "center",
    maxWidth: "100%",
  },
  rowText: { flex: 1, minWidth: 0 },
  rowIcon: {
    fontSize: 23,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F6EBD0",
    textAlign: "center",
    lineHeight: 34 as any,
  },
  arrow: { fontSize: 28, color: colors.gold, fontWeight: "900" },
  discovery: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  discoverCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    width: "47%",
    minHeight: 112,
  },
  discoverWide: { width: "100%" },
  cityRow: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cityRowImg: { width: 72, height: 58, borderRadius: 16 },
  detailHead: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontWeight: "900", color: colors.primary, fontSize: 16 },
  detailTitle: {
    fontWeight: "900",
    color: colors.primary,
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
  detailHero: {
    height: 260,
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    padding: 20,
    justifyContent: "flex-end",
    backgroundColor: colors.primary,
  },
  detailHeroImg: { borderRadius: 30 },
  thumb: {
    width: 78,
    height: 58,
    borderRadius: 14,
    marginRight: 9,
    marginTop: 12,
    borderWidth: 3,
    borderColor: "transparent",
  },
  thumbOn: { borderColor: colors.gold },
  status: {
    fontWeight: "900",
    color: "#14804a",
    backgroundColor: "#E8F6EE",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 14,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  action: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 10,
    alignItems: "center",
    minHeight: 88,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    lineHeight: 22,
  },
  info: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    minHeight: 104,
  },
  infoIcon: { fontSize: 23 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.gold,
    textTransform: "uppercase",
    marginTop: 7,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.primary,
    marginTop: 4,
    flexWrap: "wrap",
  },
  group: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeCard: {
    backgroundColor: "#F7F4EC",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "900" },
  mapMain: { backgroundColor: colors.primary },
  transportTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    marginTop: 14,
  },
});
