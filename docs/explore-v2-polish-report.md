# Explore V2 Product Redesign Phase 1A Polish Report

## Final Explore V2 structure
Explore now renders a premium short hub: hero, main search, scoped chips, popular searches, four discovery entry cards, and a compact popular city preview. Full browsing is moved into scoped tabs.

## Default screen behavior
The default screen no longer appends the full country list. It guides users into Countries, Cities, Outlets, or Brands and keeps popular searches useful without making the page endless.

## Tab behavior
- **Countries:** country search plus country rows with flag, name, localized outlet count, and arrow affordance.
- **Cities:** compact city rows. Real city images are used only when already present; otherwise a polished no-image treatment is used.
- **Outlets:** real outlet list with search and country/city filters.
- **Brands:** real brand category groups expand/collapse and show tappable brand rows that route to the existing BrandResults flow.

## Filter behavior
Inline chips provide scoped filtering by country, city, and brand category where applicable. Reset filters clears active filters and tab search fields.

## Country row count label behavior
Country rows use localized singular/plural outlet labels. Turkish remains concise as `1 outlet` / `2 outlet`; English uses `1 outlet` / `2 outlets`. Outlet is intentionally universal in other locales.

## Outlet search metadata behavior
Outlet search uses the existing search service and matches outlet names, aliases, city, country, localized country aliases, and active outlet-brand relationships.

## Brand tab behavior
Brand groups come from real active brand/category data. Brand rows show the real brand name, localized category label, and a real outlet count only when relationships exist.

## Supported locales updated
Explore V2 critical UI copy was added for en, tr, es, fr, de, ru, ar, and zh.

## Localization coverage summary
- en: source copy complete.
- tr: Turkish copy complete.
- es: neutral international Spanish complete.
- fr: neutral French complete.
- de: concise German complete.
- ru: standard app UI Russian complete.
- ar: Modern Standard Arabic complete.
- zh: Simplified Chinese complete.

## Intentional universal/proper terms
Outlet, Outlets, brand names, outlet names, city names, country names, Tax Free, Wi‑Fi, ATM, route names, provider names, and currency codes remain universal/proper where already sourced.

## Arabic/RTL note
This phase does not introduce a full RTL redesign. Rows use flexible text containers and avoid fixed text collisions so Arabic labels can wrap safely.

## Safe-area/bottom-tab preservation
Explore keeps the existing safe-area helpers: `getScreenTopInset`, `getFloatingTabClearance`, and `getScrollIndicatorBottomInset`, preserving status-bar and floating-tab clearance.

## Validation commands
- `npx tsc --noEmit`
- `npx tsx src/services/masterDataValidator.ts`
- `npx tsx tools/checkTranslationKeys.ts`
- `npx tsx tools/checkLanguageConsistency.ts`
- `npx tsx tools/checkOutletMediaMetadata.ts`
- `npx tsx tools/checkOutletMediaMetadata.ts --resolver-audit`
- `npm --prefix functions run build`
- `npx tsx tools/checkSearchRanking.ts`
- `npx tsx tools/checkExploreSearchRanking.ts`
- `git diff --check`
- `git diff --name-only`
- `git status --short`
