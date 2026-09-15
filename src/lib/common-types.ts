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

export type TranslationLang = "pashto" | "dari" | "none";
