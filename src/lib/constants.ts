import type { TranslationKey } from "@/i18n/messages";

import type { TranslationLang } from "./common-types";

export const QURAN_TITLE = "القرآن الكريم";
export const SURAH_PREFIX = "سورة";
export const BISMILLAH_TEXT = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

export const TOTAL_SURAHS = 114;
export const TOTAL_JUZ = 30;
export const FIRST_SURAH = 1;
export const FIRST_AYAH = 1;
export const SURAH_WITHOUT_BISMILLAH = 9;

export const VERSES_PER_PAGE = 10;
export const RENDER_WINDOW = 1;
export const DRAWER_SNAP_POINTS = [0.6, 0.8, 0.95];

export const TRANSLATION_OPTIONS: { value: TranslationLang; labelKey: TranslationKey }[] = [
  { value: "pashto", labelKey: "translationPashto" },
  { value: "dari", labelKey: "translationDari" },
  { value: "none", labelKey: "translationNone" },
];

export const isTranslationLang = (value: unknown): value is TranslationLang =>
  TRANSLATION_OPTIONS.some((option) => option.value === value);

export function showsOpeningBismillah(surahNumber: number): boolean {
  return surahNumber !== FIRST_SURAH && surahNumber !== SURAH_WITHOUT_BISMILLAH;
}
