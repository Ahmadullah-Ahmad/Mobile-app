import type { TranslationLang } from "../api/types";

/** How many verses to show per swipeable book page in the readers. */
export const VERSES_PER_PAGE = 5;

/** Localized labels for the translation language picker. */
export const LANG_LABELS: Record<TranslationLang, string> = {
  pashto: "پښتو",
  dari: "دری",
  both: "دواړه",
  none: "عربي",
};

/** Bismillah fallback used when the DB does not contain verse 0 for a surah. */
export const BISMILLAH_TEXT = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
