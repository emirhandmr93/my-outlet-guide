const DEBUG_LOCALE_PREFIX =
  /(?:^|\n)\s*(?:(?:TR|EN|DE|FR|IT|ES|AR|RU|ZH):|Türkçe çeviri|çeviri:|translation:)/i;

export function hasDebugLocalePrefix(value: string) {
  return DEBUG_LOCALE_PREFIX.test(value);
}

export function extractStringLiterals(source: string) {
  return Array.from(
    source.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g),
    (match) => match[2],
  );
}
