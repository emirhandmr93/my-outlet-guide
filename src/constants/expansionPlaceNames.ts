import type { TranslationLanguage } from "../translations/locale";
type Names = Record<TranslationLanguage, string>;
const names = (en: string, tr: string, es: string, fr: string, de: string, ar: string, ru: string, zh: string): Names => ({ en, tr, es, fr, de, ar, ru, zh });
export const expansionCityNames: Record<string, Names> = {
 "new-york": names("New York", "New York", "Nueva York", "New York", "New York", "نيويورك", "Нью-Йорк", "纽约"),
 "fort-lauderdale": names("Fort Lauderdale", "Fort Lauderdale", "Fort Lauderdale", "Fort Lauderdale", "Fort Lauderdale", "فورت لودرديل", "Форт-Лодердейл", "劳德代尔堡"),
 orlando: names("Orlando", "Orlando", "Orlando", "Orlando", "Orlando", "أورلاندو", "Орландо", "奥兰多"),
 "las-vegas": names("Las Vegas", "Las Vegas", "Las Vegas", "Las Vegas", "Las Vegas", "لاس فيغاس", "Лас-Вегас", "拉斯维加斯"),
 "palm-springs": names("Palm Springs", "Palm Springs", "Palm Springs", "Palm Springs", "Palm Springs", "بالم سبرينغز", "Палм-Спрингс", "棕榈泉"),
 "san-francisco": names("San Francisco", "San Francisco", "San Francisco", "San Francisco", "San Francisco", "سان فرانسيسكو", "Сан-Франциско", "旧金山"),
 bangkok: names("Bangkok", "Bangkok", "Bangkok", "Bangkok", "Bangkok", "بانكوك", "Бангкок", "曼谷"),
};
const anchorNames = { ...expansionCityNames,
 "hong-kong": names("Hong Kong", "Hong Kong", "Hong Kong", "Hong Kong", "Hongkong", "هونغ كونغ", "Гонконг", "香港"),
 taipei: names("Taipei", "Taipei", "Taipéi", "Taipei", "Taipeh", "تايبيه", "Тайбэй", "台北"),
 yeoju: names("Yeoju", "Yeoju", "Yeoju", "Yeoju", "Yeoju", "يوجو", "Йоджу", "骊州"),
 paju: names("Paju", "Paju", "Paju", "Paju", "Paju", "باجو", "Пхаджу", "坡州"),
 "busan-(seomyeon)": names("Busan (Seomyeon)", "Busan (Seomyeon)", "Busan (Seomyeon)", "Busan (Seomyeon)", "Busan (Seomyeon)", "بوسان (سوميون)", "Пусан (Сомён)", "釜山（西面）"),
 "kuala-lumpur": names("Kuala Lumpur", "Kuala Lumpur", "Kuala Lumpur", "Kuala Lumpur", "Kuala Lumpur", "كوالالمبور", "Куала-Лумпур", "吉隆坡"),
};
export function localizeExpansionPlace(value: string, language: TranslationLanguage): string {
 const key = value.toLowerCase().replace(/\s+/g, "-");
 return anchorNames[key as keyof typeof anchorNames]?.[language] ?? value;
}
