/**
 * Domain types shared by more than one module.
 *
 * Types owned by a single module live in that module's `*-config.ts`
 * (`Surah` in surahs, `Juz` in juz, `Bookmark` in bookmarks).
 *
 * Field names stay snake_case to match the SQLite column names, so rows read
 * with raw SQL need no mapping.
 */

export type RevelationType = "meccan" | "medinan";

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  arabic: string;
  pashto: string;
  dari: string;
  juz_number: number | null;
}

export interface LastRead {
  surah_id: number;
  verse_number: number;
  juz_number: number | null;
}

/** Which translation(s) the readers show under the Arabic text. */
export type TranslationLang = "pashto" | "dari" | "both" | "none";
