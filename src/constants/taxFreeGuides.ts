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
];

export function getTaxFreeCountryGuide(countryId: string) {
  return taxFreeCountryGuides.find((guide) => guide.countryId === countryId);
}
