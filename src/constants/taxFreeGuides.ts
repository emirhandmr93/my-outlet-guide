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
];

export function getTaxFreeCountryGuide(countryId: string) {
  return taxFreeCountryGuides.find((guide) => guide.countryId === countryId);
}
