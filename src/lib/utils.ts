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

/**
 * Approximate Arabic chars per line for a centered AmiriQuran column on a
 * typical phone width. Tweak if pages feel too short/long after a font-size
 * change. Lower number → more pages (shorter lines), higher → fewer pages.
 */
const ARABIC_CHARS_PER_LINE = 38;

/** Estimate how many visual lines a verse's Arabic text will occupy. */
function estimateVerseLines(arabic: string): number {
  if (!arabic) return 1;
  return Math.max(1, Math.ceil(arabic.length / ARABIC_CHARS_PER_LINE));
}

/**
 * Mushaf-style pagination: pack verses into pages by an Arabic-line budget
 * (e.g. 10 lines per page when a translation is visible, 20 when Arabic-only).
 * A single verse longer than the budget still gets its own page.
 */
export function chunkByLines<T extends { arabic: string }>(
  verses: T[],
  linesPerPage: number
): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;

  for (const v of verses) {
    const cost = estimateVerseLines(v.arabic);
    if (current.length > 0 && used + cost > linesPerPage) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(v);
    used += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

/**
 * Pack verses into pages so each page roughly fills `availableHeight`.
 * Estimates each verse's rendered height from text lengths and the active
 * font sizes, accounting for the visible translation(s). This produces
 * tightly-filled book-style pages instead of leaving big gaps at the bottom.
 *
 * Tweak the per-line capacity divisors below if pages overflow or under-fill
 * after a font-size change.
 */
/**
 * Inline-Mushaf pagination: pack verses into pages so the joined Arabic text
 * fills the screen (verses flow continuously with verse markers, like a real
 * Quran page). Estimates how many Arabic chars fit per line, then per page.
 */
/**
 * Pack verses into pages by Arabic word count (e.g. ~200 words per page).
 * A single oversized verse still gets its own page.
 */
export function paginateByWords<T extends { arabic: string }>(
  verses: T[],
  wordsPerPage: number
): T[][] {
  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;

  const wordCount = (s: string) =>
    s ? s.trim().split(/\s+/).filter(Boolean).length : 0;

  for (const v of verses) {
    const cost = wordCount(v.arabic);
    if (current.length > 0 && used + cost > wordsPerPage) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(v);
    used += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

export function paginateInline<T extends { arabic: string }>(args: {
  verses: T[];
  availableWidth: number;
  availableHeight: number;
  arabicSize: number;
  /** If set, force this many Arabic lines per page (overrides height calc). */
  linesPerPage?: number;
}): T[][] {
  const { verses, availableWidth, availableHeight, arabicSize } = args;

  const charsPerLine = Math.max(
    10,
    Math.floor(availableWidth / (arabicSize * 0.55))
  );
  const lineHeight = arabicSize * 2;
  const linesPerPage =
    args.linesPerPage ??
    Math.max(1, Math.floor(availableHeight / lineHeight));
  const charsPerPage = charsPerLine * linesPerPage;

  // Each verse marker like " ﴿123﴾ " adds ~6 visible chars.
  const MARKER_COST = 6;

  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;

  for (const v of verses) {
    const cost = (v.arabic?.length || 1) + MARKER_COST;
    if (current.length > 0 && used + cost > charsPerPage) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(v);
    used += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

export function paginateVerses<
  T extends { arabic: string; pashto?: string; dari?: string }
>(args: {
  verses: T[];
  availableWidth: number;
  availableHeight: number;
  arabicSize: number;
  transSize: number;
  showPashto: boolean;
  showDari: boolean;
}): T[][] {
  const {
    verses,
    availableWidth,
    availableHeight,
    arabicSize,
    transSize,
    showPashto,
    showDari,
  } = args;

  // How many characters fit on one line, given the font size and column width.
  // AmiriQuran shapes Arabic tightly — average glyph advance is ~0.28 × fontSize.
  // Lower these divisors → fewer chars/line (taller estimate, fewer verses/page).
  // Raise them → more chars/line (shorter estimate, more verses/page).
  const charsPerArabicLine = Math.max(
    10,
    Math.floor(availableWidth / (arabicSize * 0.28))
  );
  const charsPerTransLine = Math.max(
    10,
    Math.floor(availableWidth / (transSize * 0.35))
  );

  const arabicLineH = arabicSize * 2;
  const transLineH = transSize * 1.8;
  const verseGap = 14; // mt-3 + pt-3 + border between verses

  const heightOf = (v: T): number => {
    const arabicLines = Math.max(1, Math.ceil((v.arabic?.length || 1) / charsPerArabicLine));
    let h = arabicLines * arabicLineH;
    if (showPashto && v.pashto) {
      h += Math.ceil(v.pashto.length / charsPerTransLine) * transLineH + 6;
    }
    if (showDari && v.dari) {
      h += Math.ceil(v.dari.length / charsPerTransLine) * transLineH + 6;
    }
    return h + verseGap;
  };

  const pages: T[][] = [];
  let current: T[] = [];
  let used = 0;

  for (const v of verses) {
    const cost = heightOf(v);
    if (current.length > 0 && used + cost > availableHeight) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(v);
    used += cost;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

/** Convert a Western numeral to Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩). */
export function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
