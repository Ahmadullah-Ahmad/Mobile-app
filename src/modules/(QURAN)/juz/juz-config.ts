import type { Verse } from "@/lib/common-types";

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

export type JuzVerse = Verse & {
  surah_number: number;
  surah_name_arabic: string;
};

export interface JuzSurahGroup {
  surah_number: number;
  surah_name_arabic: string;
  items: JuzVerse[];
}
