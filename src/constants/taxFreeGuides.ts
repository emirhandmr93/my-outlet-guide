import type { TaxFreeCountryStatus } from "./taxFreeRules";

export type TaxFreeGuideStatus = Extract<TaxFreeCountryStatus, "available" | "not_available"> | "limited";
export type TaxFreeGuideSection = "before_shopping" | "in_store" | "before_departure" | "customs_validation" | "receive_refund";
export type TaxFreeGuideSourceTopic = "scheme_minimum" | "customs_validation" | "vat_rate" | "refund_process" | "goods_conditions";

export type TaxFreeGuideSource = {
  topic: TaxFreeGuideSourceTopic;
  authority: string;
  url: string;
  verifiesKey: string;
  verifiedAt: string;
};

export type TaxFreeCountryGuide = {
  countryId: string;
  status: TaxFreeGuideStatus;
  travellerEligibilitySummaryKey: string;
  requiredDocumentKeys: string[];
  processSections: Record<TaxFreeGuideSection, string[]>;
  supportedRefundMethodKeys: string[];
  goodsUseExportConditionKeys: string[];
  deadlineInformationKey: string;
  minimumPurchaseExplanationKey: string;
  vatRateExplanationKey: string;
  estimatedRefundExplanationKey: string;
  operatorFeeExplanationKey: string;
  warningKeys: string[];
  sources: TaxFreeGuideSource[];
  lastVerifiedAt: string;
};

export const taxFreeCountryGuides: TaxFreeCountryGuide[] = [
  {
    countryId: "france",
    status: "available",
    travellerEligibilitySummaryKey: "taxGuide.france.eligibilitySummary",
    requiredDocumentKeys: [
      "taxGuide.france.document.passport",
      "taxGuide.france.document.residenceProof",
      "taxGuide.france.document.exportForm",
      "taxGuide.france.document.receipts",
      "taxGuide.france.document.travelTicket",
      "taxGuide.france.document.goods",
    ],
    processSections: {
      before_shopping: [
        "taxGuide.france.step.beforeShopping.residence",
        "taxGuide.france.step.beforeShopping.retailer",
        "taxGuide.france.step.beforeShopping.goods",
      ],
      in_store: [
        "taxGuide.france.step.inStore.identity",
        "taxGuide.france.step.inStore.form",
        "taxGuide.france.step.inStore.check",
        "taxGuide.france.step.inStore.keep",
      ],
      before_departure: [
        "taxGuide.france.step.beforeDeparture.lastExit",
        "taxGuide.france.step.beforeDeparture.checkedBags",
        "taxGuide.france.step.beforeDeparture.deadline",
      ],
      customs_validation: [
        "taxGuide.france.step.customs.pablo",
        "taxGuide.france.step.customs.desk",
        "taxGuide.france.step.customs.present",
      ],
      receive_refund: [
        "taxGuide.france.step.refund.afterValidation",
        "taxGuide.france.step.refund.methods",
        "taxGuide.france.step.refund.fees",
      ],
    },
    supportedRefundMethodKeys: ["taxGuide.france.refund.method.card", "taxGuide.france.refund.method.cash", "taxGuide.france.refund.method.transfer"],
    goodsUseExportConditionKeys: ["taxGuide.france.goods.personal", "taxGuide.france.goods.baggage", "taxGuide.france.goods.unused", "taxGuide.france.goods.exclusions"],
    deadlineInformationKey: "taxGuide.france.deadline",
    minimumPurchaseExplanationKey: "taxGuide.france.minimumExplanation",
    vatRateExplanationKey: "taxGuide.france.vatExplanation",
    estimatedRefundExplanationKey: "taxGuide.france.estimatedRefundExplanation",
    operatorFeeExplanationKey: "taxGuide.france.operatorFeeExplanation",
    warningKeys: [
      "taxGuide.france.warning.validationRequired",
      "taxGuide.france.warning.checkedBaggage",
      "taxGuide.france.warning.finalEuExit",
      "taxGuide.france.warning.operatorTiming",
      "taxGuide.france.warning.customsNotPayment",
    ],
    sources: [
      { topic: "scheme_minimum", authority: "French Customs", url: "https://www.douane.gouv.fr/demarche/vous-achetez-des-marchandises-en-detaxe", verifiesKey: "taxGuide.france.source.schemeMinimum", verifiedAt: "2026-08-04" },
      { topic: "customs_validation", authority: "French Customs", url: "https://www.douane.gouv.fr/fiche/la-detaxe-en-france-pour-les-touristes-pablo", verifiesKey: "taxGuide.france.source.customsPablo", verifiedAt: "2026-08-04" },
      { topic: "goods_conditions", authority: "Service Public Entreprendre", url: "https://entreprendre.service-public.fr/vosdroits/F20558", verifiesKey: "taxGuide.france.source.goodsConditions", verifiedAt: "2026-08-04" },
      { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.france.source.vatRate", verifiedAt: "2026-08-04" },
    ],
    lastVerifiedAt: "2026-08-04",
  },
  {
    countryId: "italy",
    status: "available",
    travellerEligibilitySummaryKey: "taxGuide.italy.eligibilitySummary",
    requiredDocumentKeys: ["taxGuide.italy.document.passport", "taxGuide.italy.document.residenceProof", "taxGuide.italy.document.taxFreeInvoice", "taxGuide.italy.document.receipts", "taxGuide.italy.document.travelTicket", "taxGuide.italy.document.goods"],
    processSections: {
      before_shopping: ["taxGuide.italy.step.beforeShopping.residence", "taxGuide.italy.step.beforeShopping.retailer", "taxGuide.italy.step.beforeShopping.goods"],
      in_store: ["taxGuide.italy.step.inStore.identity", "taxGuide.italy.step.inStore.otello", "taxGuide.italy.step.inStore.check", "taxGuide.italy.step.inStore.keep"],
      before_departure: ["taxGuide.italy.step.beforeDeparture.finalExit", "taxGuide.italy.step.beforeDeparture.checkedBags", "taxGuide.italy.step.beforeDeparture.deadlines"],
      customs_validation: ["taxGuide.italy.step.customs.otello", "taxGuide.italy.step.customs.fallback", "taxGuide.italy.step.customs.present"],
      receive_refund: ["taxGuide.italy.step.refund.afterValidation", "taxGuide.italy.step.refund.methods", "taxGuide.italy.step.refund.fees"],
    },
    supportedRefundMethodKeys: ["taxGuide.italy.refund.method.card", "taxGuide.italy.refund.method.cash", "taxGuide.italy.refund.method.transfer"],
    goodsUseExportConditionKeys: ["taxGuide.italy.goods.personal", "taxGuide.italy.goods.baggage", "taxGuide.italy.goods.unused", "taxGuide.italy.goods.exclusions"],
    deadlineInformationKey: "taxGuide.italy.deadline",
    minimumPurchaseExplanationKey: "taxGuide.italy.minimumExplanation",
    vatRateExplanationKey: "taxGuide.italy.vatExplanation",
    estimatedRefundExplanationKey: "taxGuide.italy.estimatedRefundExplanation",
    operatorFeeExplanationKey: "taxGuide.italy.operatorFeeExplanation",
    warningKeys: ["taxGuide.italy.warning.validationRequired", "taxGuide.italy.warning.checkedBaggage", "taxGuide.italy.warning.finalEuExit", "taxGuide.italy.warning.deadlineReturn", "taxGuide.italy.warning.customsNotPayment"],
    sources: [
      { topic: "scheme_minimum", authority: "Agenzia delle Dogane e dei Monopoli", url: "https://www.adm.gov.it/portale/ee/citizen/otello-english-version/the-procedure", verifiesKey: "taxGuide.italy.source.schemeMinimum", verifiedAt: "2026-08-05" },
      { topic: "customs_validation", authority: "Agenzia delle Dogane e dei Monopoli", url: "https://www.adm.gov.it/portale/en/-/otello-online-tax-refund-at-exit-light-lane-optimization", verifiesKey: "taxGuide.italy.source.customsOtello", verifiedAt: "2026-08-05" },
      { topic: "goods_conditions", authority: "Agenzia delle Dogane e dei Monopoli", url: "https://vatrefund.adm.gov.it/howto", verifiesKey: "taxGuide.italy.source.goodsConditions", verifiedAt: "2026-08-05" },
      { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.italy.source.vatRate", verifiedAt: "2026-08-05" },
    ],
    lastVerifiedAt: "2026-08-05",
  },
  {
    countryId: "germany",
    status: "available",
    travellerEligibilitySummaryKey: "taxGuide.germany.eligibilitySummary",
    requiredDocumentKeys: ["taxGuide.germany.document.passport", "taxGuide.germany.document.residenceProof", "taxGuide.germany.document.invoice", "taxGuide.germany.document.exportCertificate", "taxGuide.germany.document.travelTicket", "taxGuide.germany.document.goods"],
    processSections: {
      before_shopping: ["taxGuide.germany.step.beforeShopping.residence", "taxGuide.germany.step.beforeShopping.retailer", "taxGuide.germany.step.beforeShopping.goods"],
      in_store: ["taxGuide.germany.step.inStore.identity", "taxGuide.germany.step.inStore.invoice", "taxGuide.germany.step.inStore.check", "taxGuide.germany.step.inStore.keep"],
      before_departure: ["taxGuide.germany.step.beforeDeparture.finalExit", "taxGuide.germany.step.beforeDeparture.checkedBags", "taxGuide.germany.step.beforeDeparture.deadline"],
      customs_validation: ["taxGuide.germany.step.customs.germanyExit", "taxGuide.germany.step.customs.otherEuExit", "taxGuide.germany.step.customs.present"],
      receive_refund: ["taxGuide.germany.step.refund.afterValidation", "taxGuide.germany.step.refund.methods", "taxGuide.germany.step.refund.fees"],
    },
    supportedRefundMethodKeys: ["taxGuide.germany.refund.method.card", "taxGuide.germany.refund.method.cash", "taxGuide.germany.refund.method.transfer"],
    goodsUseExportConditionKeys: ["taxGuide.germany.goods.personal", "taxGuide.germany.goods.baggage", "taxGuide.germany.goods.unused", "taxGuide.germany.goods.exclusions"],
    deadlineInformationKey: "taxGuide.germany.deadline",
    minimumPurchaseExplanationKey: "taxGuide.germany.minimumExplanation",
    vatRateExplanationKey: "taxGuide.germany.vatExplanation",
    estimatedRefundExplanationKey: "taxGuide.germany.estimatedRefundExplanation",
    operatorFeeExplanationKey: "taxGuide.germany.operatorFeeExplanation",
    warningKeys: ["taxGuide.germany.warning.validationRequired", "taxGuide.germany.warning.checkedBaggage", "taxGuide.germany.warning.finalEuExit", "taxGuide.germany.warning.residencePermit", "taxGuide.germany.warning.customsNotPayment"],
    sources: [
      { topic: "scheme_minimum", authority: "German Customs / Zoll", url: "https://www.zoll.de/EN/Private-individuals/Travel/Leaving-Germany/Tax-free-shopping/tax-free-shopping_node.html", verifiesKey: "taxGuide.germany.source.schemeMinimum", verifiedAt: "2026-08-05" },
      { topic: "customs_validation", authority: "German Customs / Zoll", url: "https://www.zoll.de/EN/Private-individuals/Travel/Leaving-Germany/Tax-free-shopping/tax-free-shopping_node.html", verifiesKey: "taxGuide.germany.source.customsCertificate", verifiedAt: "2026-08-05" },
      { topic: "goods_conditions", authority: "Federal Foreign Office", url: "https://www.germany.info/us-en/service/09-taxes/vat-refund-906296", verifiesKey: "taxGuide.germany.source.goodsConditions", verifiedAt: "2026-08-05" },
      { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.germany.source.vatRate", verifiedAt: "2026-08-05" },
    ],
    lastVerifiedAt: "2026-08-05",
  },
  {
    countryId: "spain",
    status: "available",
    travellerEligibilitySummaryKey: "taxGuide.spain.eligibilitySummary",
    requiredDocumentKeys: ["taxGuide.spain.document.passport", "taxGuide.spain.document.residenceProof", "taxGuide.spain.document.der", "taxGuide.spain.document.receipts", "taxGuide.spain.document.travelTicket", "taxGuide.spain.document.goods"],
    processSections: {
      before_shopping: ["taxGuide.spain.step.beforeShopping.residence", "taxGuide.spain.step.beforeShopping.retailer", "taxGuide.spain.step.beforeShopping.goods"],
      in_store: ["taxGuide.spain.step.inStore.identity", "taxGuide.spain.step.inStore.der", "taxGuide.spain.step.inStore.check", "taxGuide.spain.step.inStore.keep"],
      before_departure: ["taxGuide.spain.step.beforeDeparture.finalExit", "taxGuide.spain.step.beforeDeparture.checkedBags", "taxGuide.spain.step.beforeDeparture.deadline"],
      customs_validation: ["taxGuide.spain.step.customs.diva", "taxGuide.spain.step.customs.intervention", "taxGuide.spain.step.customs.otherEuExit"],
      receive_refund: ["taxGuide.spain.step.refund.afterValidation", "taxGuide.spain.step.refund.methods", "taxGuide.spain.step.refund.fees"],
    },
    supportedRefundMethodKeys: ["taxGuide.spain.refund.method.card", "taxGuide.spain.refund.method.cash", "taxGuide.spain.refund.method.transfer"],
    goodsUseExportConditionKeys: ["taxGuide.spain.goods.personal", "taxGuide.spain.goods.baggage", "taxGuide.spain.goods.unused", "taxGuide.spain.goods.exclusions"],
    deadlineInformationKey: "taxGuide.spain.deadline",
    minimumPurchaseExplanationKey: "taxGuide.spain.minimumExplanation",
    vatRateExplanationKey: "taxGuide.spain.vatExplanation",
    estimatedRefundExplanationKey: "taxGuide.spain.estimatedRefundExplanation",
    operatorFeeExplanationKey: "taxGuide.spain.operatorFeeExplanation",
    warningKeys: ["taxGuide.spain.warning.validationRequired", "taxGuide.spain.warning.checkedBaggage", "taxGuide.spain.warning.finalEuExit", "taxGuide.spain.warning.derPaper", "taxGuide.spain.warning.customsNotPayment"],
    sources: [
      { topic: "scheme_minimum", authority: "Agencia Tributaria / AEAT", url: "https://sede.agenciatributaria.gob.es/Sede/en_gb/viajeros-trabajadores-desplazados-fronterizos/devoluciones-iva-compras-viajeros/informacion-general-sobre-devolucion-iva-viajeros.html", verifiesKey: "taxGuide.spain.source.schemeMinimum", verifiedAt: "2026-08-05" },
      { topic: "customs_validation", authority: "Agencia Tributaria / AEAT", url: "https://sede.agenciatributaria.gob.es/Sede/en_gb/viajeros-trabajadores-desplazados-fronterizos/devoluciones-iva-compras-viajeros.html", verifiesKey: "taxGuide.spain.source.customsDiva", verifiedAt: "2026-08-05" },
      { topic: "refund_process", authority: "Agencia Tributaria / AEAT", url: "https://sede.agenciatributaria.gob.es/static_files/Sede/Tema/Viajeros_Desplazados/DIVA/FAQsDIVAEng0322.pdf", verifiesKey: "taxGuide.spain.source.refundProcess", verifiedAt: "2026-08-05" },
      { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.spain.source.vatRate", verifiedAt: "2026-08-05" },
    ],
    lastVerifiedAt: "2026-08-05",
  },

  {
    countryId: "portugal", status: "available", travellerEligibilitySummaryKey: "taxGuide.portugal.eligibilitySummary",
    requiredDocumentKeys: ["taxGuide.portugal.document.passport", "taxGuide.portugal.document.residenceProof", "taxGuide.portugal.document.etaxfree", "taxGuide.portugal.document.receipts", "taxGuide.portugal.document.travelTicket", "taxGuide.portugal.document.goods"],
    processSections: { before_shopping: ["taxGuide.portugal.step.beforeShopping.residence", "taxGuide.portugal.step.beforeShopping.retailer", "taxGuide.portugal.step.beforeShopping.goods"], in_store: ["taxGuide.portugal.step.inStore.identity", "taxGuide.portugal.step.inStore.etaxfree", "taxGuide.portugal.step.inStore.check", "taxGuide.portugal.step.inStore.keep"], before_departure: ["taxGuide.portugal.step.beforeDeparture.finalExit", "taxGuide.portugal.step.beforeDeparture.checkedBags", "taxGuide.portugal.step.beforeDeparture.deadline"], customs_validation: ["taxGuide.portugal.step.customs.etaxfree", "taxGuide.portugal.step.customs.desk", "taxGuide.portugal.step.customs.present"], receive_refund: ["taxGuide.portugal.step.refund.afterValidation", "taxGuide.portugal.step.refund.methods", "taxGuide.portugal.step.refund.fees"] },
    supportedRefundMethodKeys: ["taxGuide.portugal.refund.method.card", "taxGuide.portugal.refund.method.cash", "taxGuide.portugal.refund.method.transfer"], goodsUseExportConditionKeys: ["taxGuide.portugal.goods.personal", "taxGuide.portugal.goods.baggage", "taxGuide.portugal.goods.unused", "taxGuide.portugal.goods.exclusions"], deadlineInformationKey: "taxGuide.portugal.deadline", minimumPurchaseExplanationKey: "taxGuide.portugal.minimumExplanation", vatRateExplanationKey: "taxGuide.portugal.vatExplanation", estimatedRefundExplanationKey: "taxGuide.portugal.estimatedRefundExplanation", operatorFeeExplanationKey: "taxGuide.portugal.operatorFeeExplanation", warningKeys: ["taxGuide.portugal.warning.validationRequired", "taxGuide.portugal.warning.checkedBaggage", "taxGuide.portugal.warning.finalEuExit", "taxGuide.portugal.warning.etaxfree", "taxGuide.portugal.warning.customsNotPayment"],
    sources: [{ topic: "scheme_minimum", authority: "Portuguese Tax and Customs Authority", url: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00950.aspx", verifiesKey: "taxGuide.portugal.source.schemeMinimum", verifiedAt: "2026-08-05" }, { topic: "customs_validation", authority: "Portuguese Tax and Customs Authority", url: "https://info.portaldasfinancas.gov.pt/en/tax-information/Pages/default.aspx", verifiesKey: "taxGuide.portugal.source.customsEtaxfree", verifiedAt: "2026-08-05" }, { topic: "goods_conditions", authority: "Portuguese Tax and Customs Authority", url: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00950.aspx", verifiesKey: "taxGuide.portugal.source.goodsConditions", verifiedAt: "2026-08-05" }, { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.portugal.source.vatRate", verifiedAt: "2026-08-05" }], lastVerifiedAt: "2026-08-05",
  },
  { countryId: "austria", status: "available", travellerEligibilitySummaryKey: "taxGuide.austria.eligibilitySummary", requiredDocumentKeys: ["taxGuide.austria.document.passport", "taxGuide.austria.document.residenceProof", "taxGuide.austria.document.invoice", "taxGuide.austria.document.receipts", "taxGuide.austria.document.travelTicket", "taxGuide.austria.document.goods"], processSections: { before_shopping: ["taxGuide.austria.step.beforeShopping.residence", "taxGuide.austria.step.beforeShopping.retailer", "taxGuide.austria.step.beforeShopping.goods"], in_store: ["taxGuide.austria.step.inStore.identity", "taxGuide.austria.step.inStore.invoice", "taxGuide.austria.step.inStore.check", "taxGuide.austria.step.inStore.keep"], before_departure: ["taxGuide.austria.step.beforeDeparture.finalExit", "taxGuide.austria.step.beforeDeparture.checkedBags", "taxGuide.austria.step.beforeDeparture.deadline"], customs_validation: ["taxGuide.austria.step.customs.finalEuExit", "taxGuide.austria.step.customs.desk", "taxGuide.austria.step.customs.present"], receive_refund: ["taxGuide.austria.step.refund.afterValidation", "taxGuide.austria.step.refund.methods", "taxGuide.austria.step.refund.fees"] }, supportedRefundMethodKeys: ["taxGuide.austria.refund.method.card", "taxGuide.austria.refund.method.cash", "taxGuide.austria.refund.method.transfer"], goodsUseExportConditionKeys: ["taxGuide.austria.goods.personal", "taxGuide.austria.goods.baggage", "taxGuide.austria.goods.unused", "taxGuide.austria.goods.exclusions"], deadlineInformationKey: "taxGuide.austria.deadline", minimumPurchaseExplanationKey: "taxGuide.austria.minimumExplanation", vatRateExplanationKey: "taxGuide.austria.vatExplanation", estimatedRefundExplanationKey: "taxGuide.austria.estimatedRefundExplanation", operatorFeeExplanationKey: "taxGuide.austria.operatorFeeExplanation", warningKeys: ["taxGuide.austria.warning.validationRequired", "taxGuide.austria.warning.checkedBaggage", "taxGuide.austria.warning.finalEuExit", "taxGuide.austria.warning.operatorTiming", "taxGuide.austria.warning.customsNotPayment"], sources: [{ topic: "scheme_minimum", authority: "Austrian Customs", url: "https://www.bmf.gv.at/en/topics/customs/travellers/vat-refund.html", verifiesKey: "taxGuide.austria.source.schemeMinimum", verifiedAt: "2026-08-05" }, { topic: "customs_validation", authority: "Austrian Customs", url: "https://www.bmf.gv.at/en/topics/customs/travellers/vat-refund.html", verifiesKey: "taxGuide.austria.source.customsValidation", verifiedAt: "2026-08-05" }, { topic: "goods_conditions", authority: "Austrian Customs", url: "https://www.bmf.gv.at/en/topics/customs/travellers/vat-refund.html", verifiesKey: "taxGuide.austria.source.goodsConditions", verifiedAt: "2026-08-05" }, { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.austria.source.vatRate", verifiedAt: "2026-08-05" }], lastVerifiedAt: "2026-08-05" },
  { countryId: "netherlands", status: "available", travellerEligibilitySummaryKey: "taxGuide.netherlands.eligibilitySummary", requiredDocumentKeys: ["taxGuide.netherlands.document.passport", "taxGuide.netherlands.document.residenceProof", "taxGuide.netherlands.document.invoice", "taxGuide.netherlands.document.receipts", "taxGuide.netherlands.document.travelTicket", "taxGuide.netherlands.document.goods"], processSections: { before_shopping: ["taxGuide.netherlands.step.beforeShopping.residence", "taxGuide.netherlands.step.beforeShopping.retailer", "taxGuide.netherlands.step.beforeShopping.goods"], in_store: ["taxGuide.netherlands.step.inStore.identity", "taxGuide.netherlands.step.inStore.invoice", "taxGuide.netherlands.step.inStore.check", "taxGuide.netherlands.step.inStore.keep"], before_departure: ["taxGuide.netherlands.step.beforeDeparture.finalExit", "taxGuide.netherlands.step.beforeDeparture.checkedBags", "taxGuide.netherlands.step.beforeDeparture.deadline"], customs_validation: ["taxGuide.netherlands.step.customs.finalEuExit", "taxGuide.netherlands.step.customs.desk", "taxGuide.netherlands.step.customs.present"], receive_refund: ["taxGuide.netherlands.step.refund.afterValidation", "taxGuide.netherlands.step.refund.methods", "taxGuide.netherlands.step.refund.fees"] }, supportedRefundMethodKeys: ["taxGuide.netherlands.refund.method.card", "taxGuide.netherlands.refund.method.cash", "taxGuide.netherlands.refund.method.transfer"], goodsUseExportConditionKeys: ["taxGuide.netherlands.goods.personal", "taxGuide.netherlands.goods.baggage", "taxGuide.netherlands.goods.unused", "taxGuide.netherlands.goods.exclusions"], deadlineInformationKey: "taxGuide.netherlands.deadline", minimumPurchaseExplanationKey: "taxGuide.netherlands.minimumExplanation", vatRateExplanationKey: "taxGuide.netherlands.vatExplanation", estimatedRefundExplanationKey: "taxGuide.netherlands.estimatedRefundExplanation", operatorFeeExplanationKey: "taxGuide.netherlands.operatorFeeExplanation", warningKeys: ["taxGuide.netherlands.warning.validationRequired", "taxGuide.netherlands.warning.checkedBaggage", "taxGuide.netherlands.warning.finalEuExit", "taxGuide.netherlands.warning.operatorTiming", "taxGuide.netherlands.warning.customsNotPayment"], sources: [{ topic: "scheme_minimum", authority: "Dutch Tax and Customs Administration", url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/zakendoen_met_het_buitenland/zakendoen_buiten_de_eu/btw_berekenen/btw_berekenen_bij_export_van_goederen_naar_niet_eu_landen/export_door_particulier_die_buiten_de_eu_woont", verifiesKey: "taxGuide.netherlands.source.schemeMinimum", verifiedAt: "2026-08-05" }, { topic: "customs_validation", authority: "Dutch Tax and Customs Administration", url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/zakendoen_met_het_buitenland/zakendoen_buiten_de_eu/btw_berekenen/btw_berekenen_bij_export_van_goederen_naar_niet_eu_landen/export_door_particulier_die_buiten_de_eu_woont", verifiesKey: "taxGuide.netherlands.source.customsValidation", verifiedAt: "2026-08-05" }, { topic: "goods_conditions", authority: "Dutch Tax and Customs Administration", url: "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/zakendoen_met_het_buitenland/zakendoen_buiten_de_eu/btw_berekenen/btw_berekenen_bij_export_van_goederen_naar_niet_eu_landen/export_door_particulier_die_buiten_de_eu_woont", verifiesKey: "taxGuide.netherlands.source.goodsConditions", verifiedAt: "2026-08-05" }, { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.netherlands.source.vatRate", verifiedAt: "2026-08-05" }], lastVerifiedAt: "2026-08-05" },
  { countryId: "belgium", status: "available", travellerEligibilitySummaryKey: "taxGuide.belgium.eligibilitySummary", requiredDocumentKeys: ["taxGuide.belgium.document.passport", "taxGuide.belgium.document.residenceProof", "taxGuide.belgium.document.invoice", "taxGuide.belgium.document.receipts", "taxGuide.belgium.document.travelTicket", "taxGuide.belgium.document.goods"], processSections: { before_shopping: ["taxGuide.belgium.step.beforeShopping.residence", "taxGuide.belgium.step.beforeShopping.retailer", "taxGuide.belgium.step.beforeShopping.goods"], in_store: ["taxGuide.belgium.step.inStore.identity", "taxGuide.belgium.step.inStore.invoice", "taxGuide.belgium.step.inStore.check", "taxGuide.belgium.step.inStore.keep"], before_departure: ["taxGuide.belgium.step.beforeDeparture.finalExit", "taxGuide.belgium.step.beforeDeparture.checkedBags", "taxGuide.belgium.step.beforeDeparture.deadline"], customs_validation: ["taxGuide.belgium.step.customs.finalEuExit", "taxGuide.belgium.step.customs.desk", "taxGuide.belgium.step.customs.present"], receive_refund: ["taxGuide.belgium.step.refund.afterValidation", "taxGuide.belgium.step.refund.methods", "taxGuide.belgium.step.refund.fees"] }, supportedRefundMethodKeys: ["taxGuide.belgium.refund.method.card", "taxGuide.belgium.refund.method.cash", "taxGuide.belgium.refund.method.transfer"], goodsUseExportConditionKeys: ["taxGuide.belgium.goods.personal", "taxGuide.belgium.goods.baggage", "taxGuide.belgium.goods.unused", "taxGuide.belgium.goods.exclusions"], deadlineInformationKey: "taxGuide.belgium.deadline", minimumPurchaseExplanationKey: "taxGuide.belgium.minimumExplanation", vatRateExplanationKey: "taxGuide.belgium.vatExplanation", estimatedRefundExplanationKey: "taxGuide.belgium.estimatedRefundExplanation", operatorFeeExplanationKey: "taxGuide.belgium.operatorFeeExplanation", warningKeys: ["taxGuide.belgium.warning.validationRequired", "taxGuide.belgium.warning.checkedBaggage", "taxGuide.belgium.warning.finalEuExit", "taxGuide.belgium.warning.operatorTiming", "taxGuide.belgium.warning.customsNotPayment"], sources: [{ topic: "scheme_minimum", authority: "Belgian FPS Finance", url: "https://financien.belgium.be/nl/douane_accijnzen/particulieren/reizen/btw-teruggave-aan-reizigers", verifiesKey: "taxGuide.belgium.source.schemeMinimum", verifiedAt: "2026-08-05" }, { topic: "customs_validation", authority: "Belgian FPS Finance", url: "https://financien.belgium.be/nl/douane_accijnzen/particulieren/reizen/btw-teruggave-aan-reizigers", verifiesKey: "taxGuide.belgium.source.customsValidation", verifiedAt: "2026-08-05" }, { topic: "goods_conditions", authority: "Belgian FPS Finance", url: "https://financien.belgium.be/nl/douane_accijnzen/particulieren/reizen/btw-teruggave-aan-reizigers", verifiesKey: "taxGuide.belgium.source.goodsConditions", verifiedAt: "2026-08-05" }, { topic: "vat_rate", authority: "European Commission", url: "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en", verifiesKey: "taxGuide.belgium.source.vatRate", verifiedAt: "2026-08-05" }], lastVerifiedAt: "2026-08-05" },
  { countryId: "switzerland", status: "available", travellerEligibilitySummaryKey: "taxGuide.switzerland.eligibilitySummary", requiredDocumentKeys: ["taxGuide.switzerland.document.passport", "taxGuide.switzerland.document.residenceProof", "taxGuide.switzerland.document.exportDocument", "taxGuide.switzerland.document.receipts", "taxGuide.switzerland.document.travelTicket", "taxGuide.switzerland.document.goods"], processSections: { before_shopping: ["taxGuide.switzerland.step.beforeShopping.residence", "taxGuide.switzerland.step.beforeShopping.retailer", "taxGuide.switzerland.step.beforeShopping.goods"], in_store: ["taxGuide.switzerland.step.inStore.identity", "taxGuide.switzerland.step.inStore.exportDocument", "taxGuide.switzerland.step.inStore.check", "taxGuide.switzerland.step.inStore.keep"], before_departure: ["taxGuide.switzerland.step.beforeDeparture.swissExit", "taxGuide.switzerland.step.beforeDeparture.checkedBags", "taxGuide.switzerland.step.beforeDeparture.deadline"], customs_validation: ["taxGuide.switzerland.step.customs.swissCustoms", "taxGuide.switzerland.step.customs.desk", "taxGuide.switzerland.step.customs.present"], receive_refund: ["taxGuide.switzerland.step.refund.afterValidation", "taxGuide.switzerland.step.refund.methods", "taxGuide.switzerland.step.refund.fees"] }, supportedRefundMethodKeys: ["taxGuide.switzerland.refund.method.card", "taxGuide.switzerland.refund.method.cash", "taxGuide.switzerland.refund.method.transfer"], goodsUseExportConditionKeys: ["taxGuide.switzerland.goods.personal", "taxGuide.switzerland.goods.baggage", "taxGuide.switzerland.goods.unused", "taxGuide.switzerland.goods.exclusions"], deadlineInformationKey: "taxGuide.switzerland.deadline", minimumPurchaseExplanationKey: "taxGuide.switzerland.minimumExplanation", vatRateExplanationKey: "taxGuide.switzerland.vatExplanation", estimatedRefundExplanationKey: "taxGuide.switzerland.estimatedRefundExplanation", operatorFeeExplanationKey: "taxGuide.switzerland.operatorFeeExplanation", warningKeys: ["taxGuide.switzerland.warning.validationRequired", "taxGuide.switzerland.warning.checkedBaggage", "taxGuide.switzerland.warning.nonEuProcess", "taxGuide.switzerland.warning.operatorTiming", "taxGuide.switzerland.warning.customsNotPayment"], sources: [{ topic: "scheme_minimum", authority: "Swiss Federal Tax Administration", url: "https://www.estv.admin.ch/en/tax-free-for-tourists", verifiesKey: "taxGuide.switzerland.source.schemeMinimum", verifiedAt: "2026-08-05" }, { topic: "customs_validation", authority: "Swiss Federal Tax Administration", url: "https://www.estv.admin.ch/en/tax-free-for-tourists", verifiesKey: "taxGuide.switzerland.source.customsValidation", verifiedAt: "2026-08-05" }, { topic: "goods_conditions", authority: "Swiss Federal Tax Administration", url: "https://www.estv.admin.ch/en/tax-free-for-tourists", verifiesKey: "taxGuide.switzerland.source.goodsConditions", verifiedAt: "2026-08-05" }, { topic: "vat_rate", authority: "Swiss Federal Tax Administration", url: "https://www.estv.admin.ch/en/vat-rates-switzerland", verifiesKey: "taxGuide.switzerland.source.vatRate", verifiedAt: "2026-08-05" }], lastVerifiedAt: "2026-08-05" },
];

export function getTaxFreeCountryGuide(countryId: string) {
  return taxFreeCountryGuides.find((guide) => guide.countryId === countryId);
}
