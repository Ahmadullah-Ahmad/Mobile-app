/**
 * Synchronous reads for the screens that must paint immediately.
 *
 * Drizzle's expo-sqlite driver is async-only, so anything routed through it
 * needs at least one extra frame before data exists — which is exactly what the
 * loading spinners were showing. These reads use expo-sqlite's `*Sync` API so
 * the data is available during the first render and no loading state is needed.
 *
 * The trade-off is that they block the JS thread. The `timed` wrapper below
 * logs any read that exceeds a frame budget in development, so a read heavy
 * enough to be felt as a hang shows up instead of being guessed at.
 *
 * Everything else — writes, bookmarks, search — still goes through Drizzle in
 * `./queries`. Column names below match the snake_case field names on the
 * public interfaces exactly, so rows need no mapping.
 */

import type { SQLiteDatabase } from "expo-sqlite";
import type { Juz, LastRead, Surah, Verse } from "./types";

/** Logs a synchronous read that blocks longer than one frame (dev only). */
function timed<T>(label: string, fn: () => T): T {
  if (!__DEV__) return fn();
  const start = Date.now();
  const result = fn();
  const ms = Date.now() - start;
  if (ms > 16) console.log(`[sync-read] ${label} took ${ms}ms`);
  return result;
}

const SURAH_COLUMNS = `
  id, number, name_arabic, name_pashto, name_dari,
  name_transliteration, total_verses, revelation_type
`;

const VERSE_COLUMNS = `
  id, surah_id, verse_number, arabic, pashto, dari, juz_number
`;

/** The saved reading position, or null when nothing has been read yet. */
export function readLastRead(sqlite: SQLiteDatabase): LastRead | null {
  return timed("readLastRead", () =>
    sqlite.getFirstSync<LastRead>(
      `SELECT surah_id, verse_number, juz_number FROM last_read WHERE id = 1`
    )
  );
}

/** All 114 surahs, ordered by number. */
export function readSurahs(sqlite: SQLiteDatabase): Surah[] {
  const rows = timed("readSurahs", () =>
    sqlite.getAllSync<Omit<Surah, "has_content">>(
      `SELECT ${SURAH_COLUMNS} FROM surahs ORDER BY number`
    )
  );
  // Every surah in the shipped DB has verses; the flag is kept because
  // SurahCard still reads it.
  return rows.map((r) => ({ ...r, has_content: true }));
}

/** All 30 juz with the starting surah's Arabic name. */
export function readJuzList(sqlite: SQLiteDatabase): Juz[] {
  return timed("readJuzList", () =>
    sqlite.getAllSync<Juz>(
      `SELECT j.number, j.start_surah, j.start_verse, j.end_surah, j.end_verse,
              j.name_arabic, j.name_pashto, j.name_dari,
              s.name_arabic AS start_surah_name
       FROM juz j
       JOIN surahs s ON s.number = j.start_surah
       ORDER BY j.number`
    )
  );
}

/** One surah's metadata by its number (1-114), or null when unknown. */
export function readSurah(
  sqlite: SQLiteDatabase,
  surahNumber: number
): Surah | null {
  const row = timed("readSurah", () =>
    sqlite.getFirstSync<Omit<Surah, "has_content">>(
      `SELECT ${SURAH_COLUMNS} FROM surahs WHERE number = ?`,
      surahNumber
    )
  );
  return row ? { ...row, has_content: true } : null;
}

/** Every verse of a surah, by surah id, ordered by verse number. */
export function readVerses(sqlite: SQLiteDatabase, surahId: number): Verse[] {
  return timed(`readVerses(surah ${surahId})`, () =>
    sqlite.getAllSync<Verse>(
      `SELECT ${VERSE_COLUMNS} FROM verses WHERE surah_id = ? ORDER BY verse_number`,
      surahId
    )
  );
}

/** Every verse of a juz, tagged with its surah number and Arabic name. */
export function readJuzVerses(
  sqlite: SQLiteDatabase,
  juzNumber: number
): (Verse & { surah_number: number; surah_name_arabic: string })[] {
  return timed(`readJuzVerses(juz ${juzNumber})`, () =>
    sqlite.getAllSync<
      Verse & { surah_number: number; surah_name_arabic: string }
    >(
      `SELECT v.id, v.surah_id, v.verse_number, v.arabic, v.pashto, v.dari,
              v.juz_number, s.number AS surah_number,
              s.name_arabic AS surah_name_arabic
       FROM verses v
       JOIN surahs s ON s.id = v.surah_id
       WHERE v.juz_number = ?
       ORDER BY s.number, v.verse_number`,
      juzNumber
    )
  );
}
