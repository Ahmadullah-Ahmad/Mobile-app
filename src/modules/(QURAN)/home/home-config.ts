import { TOTAL_JUZ } from "@/lib/constants";

export const HOME_SURAH_COUNT = 3;
export const HOME_JUZ_COUNT = 5;

export interface ContinueReading {
  surah: { id: number; number: number; name_arabic: string; total_verses: number } | null;
  verseNumber: number;
  juzNumber: number;
  route: string;
}

export function juzWindow(currentJuz: number): number[] {
  const start = Math.max(1, Math.min(currentJuz, TOTAL_JUZ - HOME_JUZ_COUNT + 1));
  return Array.from({ length: HOME_JUZ_COUNT }, (_, i) => start + i);
}
