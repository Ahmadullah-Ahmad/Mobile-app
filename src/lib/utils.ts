import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger — combines clsx + tailwind-merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Split an array into fixed-size chunks. */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Convert a Western numeral to Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩). */
export function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

type NumberedVerse = { verse_number: number };

/** "٣" for a single verse, "٣–٧" for a range, "" for an empty page. */
export function formatVerseRange(verses: NumberedVerse[]): string {
  const first = verses[0]?.verse_number;
  const last = verses[verses.length - 1]?.verse_number;
  if (!first || !last) return "";
  return first === last
    ? toArabicNumeral(first)
    : `${toArabicNumeral(first)}–${toArabicNumeral(last)}`;
}

/** Arabic text of the verses joined with their ﴿n﴾ markers, for the share sheet. */
export function formatVersesForShare(
  verses: (NumberedVerse & { arabic: string })[]
): string {
  return verses
    .map((v) => `${v.arabic} ﴿${toArabicNumeral(v.verse_number)}﴾`)
    .join(" ");
}
