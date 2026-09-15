import type { TranslationLang } from "./common-types";

/** Labels for the translation language picker. */
export const LANG_LABELS: Record<TranslationLang, string> = {
  pashto: "پښتو",
  dari: "دری",
  both: "دواړه",
  none: "عربي",
};

/** Bismillah fallback used when the DB does not contain verse 0 for a surah. */
export const BISMILLAH_TEXT = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

/** At-Tawba is the only surah that does not open with the Bismillah. */
export const SURAH_WITHOUT_BISMILLAH = 9;

/** Green used for verse markers and active icons. */
export const ACCENT_COLOR = "#16a34a";

/** Pages this far either side of the current one stay mounted in a reader. */
export const RENDER_WINDOW = 1;

/** 10 verses per book page when a translation is visible, 15 when Arabic-only. */
export function versesPerPage(lang: TranslationLang): number {
  return lang === "none" ? 15 : 10;
}
