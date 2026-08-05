import type { TaxFreeRule, TaxFreeSource } from "../constants/taxFreeRules";
import type { TranslationLanguage } from "../translations/translations";

type Translate = (key: string) => string;

export type TaxFreeSourceRole = "scheme" | "vat_rate" | "minimum" | "refund_policy";

export type TaxFreeSourceDisplayRow = {
  identity: string;
  roles: TaxFreeSourceRole[];
  roleLabel: string;
  authorityName: string;
  checkedDate: string;
};

const sourceRoleKeys: Record<TaxFreeSourceRole, string> = {
  scheme: "taxCalc.schemeSourceLabel",
  vat_rate: "taxCalc.vatRateSourceLabel",
  minimum: "taxCalc.minimumSourceLabel",
  refund_policy: "taxCalc.refundPolicySourceLabel",
};

export const taxFreeSourceTranslationKeys = {
  "Agenzia delle Entrate": "taxFreeSource.agenziaDelleEntrate",
  "Bulgarian National Revenue Agency": "taxFreeSource.bulgarianNra",
  "Estonian Tax and Customs Board": "taxFreeSource.estonianTaxCustomsBoard",
  "Latvian State Revenue Service": "taxFreeSource.latvianStateRevenueService",
  "Lithuanian State Tax Inspectorate / VMI": "taxFreeSource.lithuanianVmi",
  "Greek Independent Authority for Public Revenue / AADE": "taxFreeSource.greekAade",
  "Slov-Lex / Slovak statutory source": "taxFreeSource.slovLexSlovakStatutory",
  "European Commission — VAT rates": "taxCalc.sourceEuropeanCommissionVatRates",
  "European Commission — VAT refunds": "taxFreeSource.europeanCommissionVatRefunds",
  "French Customs": "taxFreeSource.frenchCustoms",
  "Danish Customs Agency": "taxFreeSource.danishCustomsAgency",
  "Finnish Tax Administration": "taxFreeSource.finnishTaxAdministration",
  "Swedish Customs": "taxFreeSource.swedishCustoms",
  "Swedish Tax Agency": "taxFreeSource.swedishTaxAgency",
  "Irish Revenue": "taxFreeSource.irishRevenue",
  "German Customs / Zoll": "taxFreeSource.germanCustomsZoll",
  "Agencia Tributaria / AEAT": "taxFreeSource.agenciaTributariaAeat",
  "Austrian Customs": "taxFreeSource.austrianCustoms",
  "Belgian FPS Finance": "taxFreeSource.belgianFpsFinance",
  "Dutch Tax and Customs Administration": "taxFreeSource.dutchTaxCustoms",
  "Croatian Customs Administration": "taxFreeSource.croatianCustomsAdministration",
  "Czech Customs Administration": "taxFreeSource.czechCustomsAdministration",
  "Hungarian National Tax and Customs Administration": "taxFreeSource.hungarianNav",
  "Polish Ministry of Finance / PUESC": "taxFreeSource.polishPuesc",
  "Romanian Customs Authority": "taxFreeSource.romanianCustomsAuthority",
  "Romanian Legislative Portal — Law 141/2025": "taxFreeSource.romanianLegislativePortalLaw141",
  "Invest KOREA / KOTRA": "taxFreeSource.investKoreaKotra",
  "Japan National Tax Agency": "taxFreeSource.japanNationalTaxAgency",
  "Japan Tourism Agency": "taxFreeSource.japanTourismAgency",
  "Japan Tourism Agency — refund-system transition": "taxFreeSource.japanTourismAgencyTransition",
  "Korea Tourism Organization / VISITKOREA": "taxFreeSource.koreaTourismVisitKorea",
  "Norwegian Customs": "taxFreeSource.norwegianCustoms",
  "Norwegian Tax Administration": "taxFreeSource.norwegianTaxAdministration",
  "Portuguese Tax and Customs Authority": "taxFreeSource.portugueseTaxCustoms",
  "State Taxation Administration": "taxFreeSource.stateTaxationAdministration",
  "Swiss Federal Tax Administration": "taxFreeSource.swissFederalTaxAdministration",
  "Thailand Revenue Department": "taxFreeSource.thailandRevenueDepartment",
  "Turkish Revenue Administration": "taxFreeSource.turkishRevenueAdministration",
  "UAE Government Portal": "taxFreeSource.uaeGovernmentPortal",
  "UAE Federal Tax Authority": "taxFreeSource.uaeFederalTaxAuthority",
} as const;

export function isMappedTaxFreeSourceName(name: string) {
  return Object.prototype.hasOwnProperty.call(taxFreeSourceTranslationKeys, name);
}

export function getLocalizedTaxFreeSourceName(
  source: TaxFreeSource,
  _language: TranslationLanguage,
  t: Translate,
) {
  const key = taxFreeSourceTranslationKeys[source.name as keyof typeof taxFreeSourceTranslationKeys];
  return key ? t(key) : source.name;
}

export function getTaxFreeSourceIdentity(source: TaxFreeSource) {
  return `${source.name}\u0000${source.url}\u0000${source.checkedDate}`;
}

export function getTaxFreeSourceDisplayRows(
  rule: TaxFreeRule,
  language: TranslationLanguage,
  t: Translate,
  includeMinimum = true,
): TaxFreeSourceDisplayRow[] {
  const candidates: Array<{ role: TaxFreeSourceRole; source: TaxFreeSource }> = [
    { role: "scheme", source: rule.schemeSource },
    { role: "vat_rate", source: rule.vatRateSource },
  ];
  if (includeMinimum && rule.minimumPurchaseStatus === "verified_amount" && rule.minimumPurchaseSource) {
    candidates.push({ role: "minimum", source: rule.minimumPurchaseSource });
  }
  candidates.push({ role: "refund_policy", source: rule.refundPolicy.source });

  const rows = new Map<string, { source: TaxFreeSource; roles: TaxFreeSourceRole[] }>();
  for (const candidate of candidates) {
    const identity = getTaxFreeSourceIdentity(candidate.source);
    const existing = rows.get(identity);
    if (existing) existing.roles.push(candidate.role);
    else rows.set(identity, { source: candidate.source, roles: [candidate.role] });
  }

  return [...rows.entries()].map(([identity, { source, roles }]) => ({
    identity,
    roles,
    roleLabel: roles.map((role) => t(sourceRoleKeys[role])).join(" · "),
    authorityName: getLocalizedTaxFreeSourceName(source, language, t),
    checkedDate: source.checkedDate,
  }));
}
