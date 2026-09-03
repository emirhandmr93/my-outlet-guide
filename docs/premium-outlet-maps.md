# Premium 3D Outlet Map pilot

## Release scope

The pilot is intentionally limited to ten high-interest outlets whose existing application records include an active brand directory. The application calls the feature **3D Outlet Map**. “2.5D” is not user-facing copy.

| Outlet | Official directory/map reference |
| --- | --- |
| Bicester Village | <https://www.thebicestercollection.com/bicester-village/en/map/> |
| La Vallée Village | <https://www.thebicestercollection.com/la-vallee-village/en/map/> |
| Serravalle Designer Outlet | <https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/plan-your-visit/map/> |
| La Roca Village | <https://www.thebicestercollection.com/la-roca-village/en/map/> |
| Las Rozas Village | <https://www.thebicestercollection.com/las-rozas-village/en/map/> |
| Designer Outlet Roermond | <https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/plan-your-visit/map/> |
| Outletcity Metzingen | <https://www.outletcity.com/en/metzingen/map/> |
| The Mall Firenze | <https://firenze.themall.it/en/visit-us> |
| Noventa di Piave Designer Outlet | <https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa-di-piave/plan-your-visit/map/> |
| Fidenza Village | <https://www.thebicestercollection.com/fidenza-village/en/map/> |

## Implemented behaviour

- MapLibre native rendering with an offline local style, original building polygons, height, roads, walkways, landscape and trees.
- Native text annotations, so brand and POI labels do not depend on remote glyph downloads.
- Accent-insensitive brand search. Selecting a result opens its floor, flies to the store and applies a gold glow.
- Unknown searches return no location, avoiding false store placement.
- A dedicated outlet-scoped listener loads up to 100 verified active campaigns without relying on the Home carousel cap. Matching stores become gold and the details card shows the campaign end date; the highlight disappears when the campaign service expires it.
- Store cards show brand, localized category label, outlet opening hours and active campaign information.
- Parking, entrance, exit, WC, accessible WC, Tax Free, information, food/cafés, ATM, prayer room, baby care, EV charging and floor access POIs.
- Premium and low-resource simple modes, controlled rotation, smooth camera focus, 52-point controls and a versioned on-device offline data cache.
- Lazy per-outlet generation keeps the 1,290-store pilot dataset out of memory until a user opens one of the eligible maps.
- Complete interface copy and POI labels in English, Turkish, Spanish, French, German, Arabic, Russian and Chinese.
- A minimal entry button is shown only on the ten eligible outlet detail pages. Existing Outlet Match, campaign, travel, savings, home and search flows are unchanged.

## Accuracy and rights boundary

The current geometry is an **original schematic editorial redraw** generated from the application’s existing outlet and brand directory. It does not copy or redistribute the artwork, tiles, tokens or credentials of an outlet’s official map. Official pages are retained as dated directory references and are opened only through the app’s safe external-link helper.

It is not represented as surveyed, licensed-exact, indoor turn-by-turn navigation. Publishing exact store polygons and exact service coordinates requires either written redistribution permission/a licensed data feed or an independently commissioned on-site survey and digitisation. Until that content gate is cleared, the interface states that each plan is schematic.

## Release gates

1. `npm run typecheck`
2. `npm run validate:premium-maps`
3. `npm run validate:release`
4. Manual iOS and Android checks: search, floor focus, rotation, zoom, campaign lifecycle, screen reader order, Arabic RTL, low-resource mode and offline relaunch.
5. A fresh native EAS build is mandatory after merge because the MapLibre Expo config plugin adds native code; Expo Go is not a valid acceptance environment for this feature.
