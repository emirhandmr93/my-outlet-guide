import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");

type Copy = {
  heading: string;
  intro: string;
  vatLabel: string;
  minimumLabel: string;
  grossLabel: string;
  netLabel: string;
  noMinimumLabel: string;
  sourceLabel: string;
  checkedLabel: string;
  caveat: string;
  calculatorLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    heading: "Tax Free shopping facts for {country}",
    intro: "Use these verified reference fields when planning Tax Free shopping in {country}.",
    vatLabel: "Standard VAT rate reference",
    minimumLabel: "Verified minimum purchase",
    grossLabel: "gross",
    netLabel: "net",
    noMinimumLabel: "No statutory minimum is listed in the verified rule",
    sourceLabel: "Official source",
    checkedLabel: "source checked",
    caveat: "Eligibility, product category, retailer participation and operator or administration fees can change the final refund. Confirm the current official conditions before purchase.",
    calculatorLabel: "Open the Tax Free calculator",
  },
  tr: {
    heading: "{country} için Tax Free alışveriş bilgileri",
    intro: "{country} Tax Free alışveriş planlamasında doğrulanmış bu referans alanlarını kullanın.",
    vatLabel: "Standart KDV oranı referansı",
    minimumLabel: "Doğrulanmış minimum alışveriş",
    grossLabel: "brüt",
    netLabel: "net",
    noMinimumLabel: "Doğrulanmış kuralda yasal bir minimum tutar belirtilmiyor",
    sourceLabel: "Resmî kaynak",
    checkedLabel: "kaynak kontrol tarihi",
    caveat: "Uygunluk, ürün kategorisi, mağaza katılımı ve operatör veya işlem ücretleri nihai iadeyi değiştirebilir. Satın almadan önce güncel resmî koşulları doğrulayın.",
    calculatorLabel: "Tax Free hesaplayıcısını aç",
  },
  es: {
    heading: "Datos de compras Tax Free en {country}",
    intro: "Utiliza estos campos de referencia verificados para planificar compras Tax Free en {country}.",
    vatLabel: "Referencia del tipo estándar de IVA",
    minimumLabel: "Compra mínima verificada",
    grossLabel: "bruto",
    netLabel: "neto",
    noMinimumLabel: "La norma verificada no indica un mínimo legal",
    sourceLabel: "Fuente oficial",
    checkedLabel: "fuente revisada",
    caveat: "La elegibilidad, la categoría del producto, la participación del comercio y las comisiones pueden cambiar el reembolso final. Confirma las condiciones oficiales vigentes antes de comprar.",
    calculatorLabel: "Abrir la calculadora Tax Free",
  },
  fr: {
    heading: "Informations Tax Free pour {country}",
    intro: "Utilisez ces données de référence vérifiées pour préparer vos achats Tax Free en {country}.",
    vatLabel: "Référence du taux standard de TVA",
    minimumLabel: "Achat minimum vérifié",
    grossLabel: "TTC",
    netLabel: "HT",
    noMinimumLabel: "Aucun minimum légal n’est indiqué dans la règle vérifiée",
    sourceLabel: "Source officielle",
    checkedLabel: "source vérifiée le",
    caveat: "L’éligibilité, la catégorie du produit, la participation du commerçant et les frais d’opérateur ou administratifs peuvent modifier le remboursement final. Vérifiez les conditions officielles en vigueur avant l’achat.",
    calculatorLabel: "Ouvrir le calculateur Tax Free",
  },
  de: {
    heading: "Tax-Free-Informationen für {country}",
    intro: "Nutzen Sie diese geprüften Referenzwerte für die Planung von Tax-Free-Einkäufen in {country}.",
    vatLabel: "Referenz für den Standard-Mehrwertsteuersatz",
    minimumLabel: "Geprüfter Mindesteinkauf",
    grossLabel: "brutto",
    netLabel: "netto",
    noMinimumLabel: "In der geprüften Regel ist kein gesetzlicher Mindestbetrag angegeben",
    sourceLabel: "Offizielle Quelle",
    checkedLabel: "Quelle geprüft am",
    caveat: "Berechtigung, Produktkategorie, Händlerteilnahme sowie Betreiber- oder Verwaltungsgebühren können die endgültige Erstattung verändern. Prüfen Sie vor dem Kauf die aktuellen offiziellen Bedingungen.",
    calculatorLabel: "Tax-Free-Rechner öffnen",
  },
  ar: {
    heading: "معلومات Tax Free للتسوق في {country}",
    intro: "استخدم هذه البيانات المرجعية الموثقة عند التخطيط للتسوق بنظام Tax Free في {country}.",
    vatLabel: "مرجع معدل ضريبة القيمة المضافة القياسي",
    minimumLabel: "الحد الأدنى الموثق للشراء",
    grossLabel: "شامل الضريبة",
    netLabel: "قبل الضريبة",
    noMinimumLabel: "لا تحدد القاعدة الموثقة حداً أدنى قانونياً",
    sourceLabel: "المصدر الرسمي",
    checkedLabel: "تاريخ مراجعة المصدر",
    caveat: "قد تؤثر الأهلية وفئة المنتج ومشاركة المتجر ورسوم المشغل أو الإدارة في قيمة الاسترداد النهائية. تحقق من الشروط الرسمية الحالية قبل الشراء.",
    calculatorLabel: "فتح حاسبة Tax Free",
  },
  ru: {
    heading: "Данные Tax Free для покупок в {country}",
    intro: "Используйте эти проверенные справочные данные при планировании покупок Tax Free в {country}.",
    vatLabel: "Справочный стандартный НДС",
    minimumLabel: "Проверенная минимальная покупка",
    grossLabel: "с НДС",
    netLabel: "без НДС",
    noMinimumLabel: "В проверенном правиле не указан установленный законом минимум",
    sourceLabel: "Официальный источник",
    checkedLabel: "источник проверен",
    caveat: "Право на возврат, категория товара, участие магазина и комиссии оператора или административные сборы могут изменить итоговую сумму. Перед покупкой проверьте актуальные официальные условия.",
    calculatorLabel: "Открыть калькулятор Tax Free",
  },
  zh: {
    heading: "{country} Tax Free 退税购物信息",
    intro: "规划{country} Tax Free 退税购物时，可参考以下已核实字段。",
    vatLabel: "标准增值税率参考",
    minimumLabel: "已核实最低消费",
    grossLabel: "含税",
    netLabel: "未税",
    noMinimumLabel: "已核实规则未列出法定最低消费金额",
    sourceLabel: "官方来源",
    checkedLabel: "来源核查日期",
    caveat: "退税资格、商品类别、商家参与情况以及运营或管理费用都可能影响最终退税金额。购买前请确认最新官方条件。",
    calculatorLabel: "打开 Tax Free 退税计算器",
  },
};

const LOCALES: Record<TranslationLanguage, string> = {
  en: "en-US",
  tr: "tr-TR",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ar: "ar",
  ru: "ru-RU",
  zh: "zh-CN",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

function formatNumber(language: TranslationLanguage, value: number) {
  return new Intl.NumberFormat(LOCALES[language], {
    maximumFractionDigits: 2,
  }).format(value);
}

const publicCountryIds = new Set(
  outlets.filter(isWebSeoPublicOutlet).map((outlet) => outlet.countryId),
);

const rules = taxFreeRules
  .filter((rule) => publicCountryIds.has(rule.countryId))
  .sort((a, b) => a.countryId.localeCompare(b.countryId));

async function enhanceCountry(language: TranslationLanguage, rule: (typeof taxFreeRules)[number]) {
  const copy = COPY[language];
  const country = formatCountryDisplayName(rule.countryId, language);
  const heading = fill(copy.heading, { country });
  const intro = fill(copy.intro, { country });
  const vat = `${formatNumber(language, rule.vatRate)}%`;

  let minimum = "";
  if (
    rule.minimumPurchaseStatus === "verified_amount" &&
    typeof rule.minimumPurchaseAmount === "number"
  ) {
    const comparison = rule.minimumPurchaseComparison === "greater_than" ? ">" : "≥";
    const basis = rule.minimumPurchaseBasis === "net" ? copy.netLabel : copy.grossLabel;
    minimum = `<li><strong>${escapeHtml(copy.minimumLabel)}:</strong> ${comparison} ${escapeHtml(rule.currency)} ${escapeHtml(formatNumber(language, rule.minimumPurchaseAmount))} (${escapeHtml(basis)})</li>`;
  } else if (rule.minimumPurchaseStatus === "no_statutory_minimum") {
    minimum = `<li><strong>${escapeHtml(copy.minimumLabel)}:</strong> ${escapeHtml(copy.noMinimumLabel)}</li>`;
  }

  const source = rule.schemeSource;
  const section = `<section data-country-tax-free-seo="${rule.countryId}"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(intro)}</p><ul><li><strong>${escapeHtml(copy.vatLabel)}:</strong> ${escapeHtml(vat)}</li>${minimum}<li><strong>${escapeHtml(copy.sourceLabel)}:</strong> <a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a> (${escapeHtml(copy.checkedLabel)}: ${escapeHtml(source.checkedDate)})</li></ul><p>${escapeHtml(copy.caveat)}</p><p><a href="${WEB_SEO_ORIGIN}/${language}/calculator/tax-free">${escapeHtml(copy.calculatorLabel)}</a></p></section>`;

  const file = join(DIST, language, "country", `${rule.countryId}.html`);
  let html = await readFile(file, "utf8");
  html = html.replace(
    new RegExp(`<section data-country-tax-free-seo="${rule.countryId}">[\\s\\S]*?<\\/section>`, "i"),
    "",
  );
  html = html.replace(/<\/main>/i, `${section}</main>`);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await Promise.all(rules.map((rule) => enhanceCountry(language, rule)));
    console.log(`enhanceCountryTaxFreeSeo: completed ${language} (${rules.length} country rules).`);
  }

  console.log(
    `enhanceCountryTaxFreeSeo: added verified Tax Free reference facts for ${rules.length} public outlet countries in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
