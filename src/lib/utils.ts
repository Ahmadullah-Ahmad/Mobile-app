import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const EXTENDED_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toArabicNumeral(n: number | string): string {
  return String(n).replace(/\d/g, (d) => EXTENDED_ARABIC_DIGITS[Number(d)]);
}

export function interpolate(
  template: string,
  params: Record<string, string | number>,
  formatNumber: (n: number) => string
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    if (value === undefined) return match;
    return typeof value === "number" ? formatNumber(value) : value;
  });
}

type NumberedVerse = { verse_number: number };

export function formatVerseRange(
  verses: NumberedVerse[],
  formatNumber: (n: number) => string
): string {
  const first = verses[0]?.verse_number;
  const last = verses[verses.length - 1]?.verse_number;
  if (!first || !last) return "";
  return first === last
    ? formatNumber(first)
    : `${formatNumber(first)}–${formatNumber(last)}`;
}

export function formatVersesForShare(
  verses: (NumberedVerse & { arabic: string })[]
): string {
  return verses
    .map((v) => `${v.arabic} ﴿${toArabicNumeral(v.verse_number)}﴾`)
    .join(" ");
}
