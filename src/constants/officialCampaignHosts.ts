/**
 * Client-side mirror of the Cloud Functions source allowlist. Campaign
 * validation tests enforce exact parity so newly tracked outlets cannot be
 * collected successfully and then disappear from the app.
 */
export const officialCampaignHostsByOutlet: Readonly<
  Record<string, readonly string[]>
> = {
  "bicester-village": ["www.thebicestercollection.com"],
  "la-vallee-village": ["www.thebicestercollection.com"],
  "fidenza-village": ["www.thebicestercollection.com"],
  "the-mall-firenze": ["firenze.themall.it"],
  "wertheim-village": ["www.thebicestercollection.com"],
  "ingolstadt-village": ["www.thebicestercollection.com"],
  "la-roca-village": ["www.thebicestercollection.com"],
  "las-rozas-village": ["www.thebicestercollection.com"],
  "kildare-village": ["www.thebicestercollection.com"],
  "maasmechelen-village": ["www.thebicestercollection.com"],
  "cheshire-oaks": ["www.mcarthurglen.com"],
  "designer-outlet-roermond": ["www.mcarthurglen.com"],
  "designer-outlet-parndorf": ["www.mcarthurglen.com"],
  "serravalle-designer-outlet": ["www.mcarthurglen.com"],
  "castel-romano": ["www.mcarthurglen.com"],
  "noventa": ["www.mcarthurglen.com"],
  "designer-outlet-malaga": ["www.mcarthurglen.com"],
  "york-designer-outlet": ["www.mcarthurglen.com"],
  "ashford-designer-outlet": ["www.mcarthurglen.com"],
  "designer-outlet-athens": [
    "designeroutletathens.gr",
    "www.designeroutletathens.gr",
  ],
  "batavia-stad-fashion-outlet": ["www.bataviastad.nl"],
  "franciacorta-designer-village": [
    "www.franciacortavillage.it",
    "www.franciacortadesignervillage.com",
  ],
};
