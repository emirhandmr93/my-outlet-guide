/**
 * Client-side mirror of the Cloud Functions source allowlist. Campaign
 * validation tests enforce exact parity so newly tracked outlets cannot be
 * collected successfully and then disappear from the app.
 */
export const officialCampaignHostsByOutlet: Readonly<
  Record<string, readonly string[]>
> = {
  "bicester-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "la-vallee-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "fidenza-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "the-mall-firenze": ["firenze.themall.it"],
  "wertheim-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "ingolstadt-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "la-roca-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "las-rozas-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "kildare-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "maasmechelen-village": ["www.thebicestercollection.com", "thebicestercollection.com"],
  "cheshire-oaks": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "designer-outlet-roermond": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "designer-outlet-parndorf": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "serravalle-designer-outlet": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "castel-romano": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "noventa": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "designer-outlet-malaga": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "york-designer-outlet": ["www.mcarthurglen.com", "mcarthurglen.com"],
  "ashford-designer-outlet": ["www.mcarthurglen.com", "mcarthurglen.com"],
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
