import {
  getTargetQuickInfo as getBaseTargetQuickInfo,
  localizeTargetGuide,
  targetContentLanguages,
  type LocalizedGuideCopy,
  type TargetContentLanguage,
} from "./targetOutletLocalizationBase";
import { finalExpansionQuickInfo } from "./finalExpansionQuickInfo";

export { localizeTargetGuide, targetContentLanguages };
export type { LocalizedGuideCopy, TargetContentLanguage };

export function getTargetQuickInfo(outletId: string, language: string) {
  const lang = (targetContentLanguages.includes(language as TargetContentLanguage) ? language : "en") as TargetContentLanguage;
  return finalExpansionQuickInfo(outletId, lang) ?? getBaseTargetQuickInfo(outletId, language);
}
