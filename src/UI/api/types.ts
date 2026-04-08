/**
 * Public domain types for the Quran feature.
 *
 * Snake_case field names are preserved because UI components and hooks
 * already consume them that way (matching the legacy SQLite column names).
 */

export type RevelationType = "meccan" | "medinan";

export interface Surah {
  id: number;
  number: number;
  name_arabic: string;
  name_pashto: string;
  name_dari: string;
  name_transliteration: string;
  total_verses: number;
  revelation_type: RevelationType;
  /** True when any verse in this surah has been parsed into the DB */
  has_content: boolean;
}

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  arabic: string;
  pashto: string;
  dari: string;
}

export interface Bookmark {
  id: number;
  surah_id: number;
  verse_number: number;
  note: string;
  created_at: string;
}

export interface LastRead {
  surah_id: number;
  verse_number: number;
  juz_number: number | null;
}

export interface Juz {
  number: number;
  start_surah: number;
  start_verse: number;
  end_surah: number;
  end_verse: number;
  name_arabic: string;
  name_pashto: string;
  name_dari: string;
  start_surah_name?: string;
  verse_count?: number;
}

/** UI-level translation language preference. */
export type TranslationLang = "pashto" | "dari" | "both" | "none";
