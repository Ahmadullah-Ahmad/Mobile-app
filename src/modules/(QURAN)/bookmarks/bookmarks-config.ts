export interface Bookmark {
  id: number;
  surah_id: number;
  surah_number: number;
  surah_name_arabic: string;
  verse_number: number;
  juz_number: number | null;
  note: string;
  created_at: string;
}

export const bookmarkKey = (surahId: number, verseNumber: number) =>
  `${surahId}:${verseNumber}`;
