/**
 * Quran database – initialization and typed query helpers.
 *
 * On first launch the pre-seeded `assets/db/quran.db` is copied into the
 * app's private SQLite directory.  Subsequent launches re-use the copy so
 * user-data (bookmarks, last-read position) is preserved across updates.
 */

import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  /** If set, user was reading by juz; otherwise by surah */
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
  /** Surah name at the start of this juz */
  start_surah_name?: string;
  /** Total verses in this juz */
  verse_count?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DB bootstrap – copies bundled asset to writable location on first run
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME = "quran.db";
const DB_DIR = `${FileSystem.documentDirectory}SQLite/`;
const DB_PATH = `${DB_DIR}${DB_NAME}`;

/**
 * Bump this number every time `assets/db/quran.db` is rebuilt so the app
 * replaces its cached copy on next launch.  User data (bookmarks, last-read)
 * is re-created from scratch — acceptable while the app is pre-release.
 */
const BUNDLED_DB_VERSION = 4; // v1 = Al-Kahf only, v2 = all surahs + Dari, v3 = juz, v4 = last_read.juz_number
const DB_VERSION_KEY = `${DB_DIR}.dbVersion`;

export async function openQuranDatabase(): Promise<SQLite.SQLiteDatabase> {
  // Ensure the SQLite directory exists
  const { exists: dirExists } = await FileSystem.getInfoAsync(DB_DIR);
  if (!dirExists) {
    await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });
  }

  // Check if the bundled DB is newer than the cached copy
  const { exists: dbExists } = await FileSystem.getInfoAsync(DB_PATH);
  const versionFile = DB_VERSION_KEY;
  let needsCopy = !dbExists;

  if (dbExists) {
    try {
      const stored = await FileSystem.readAsStringAsync(versionFile);
      if (Number(stored) < BUNDLED_DB_VERSION) needsCopy = true;
    } catch {
      // No version file → old DB from before versioning was added
      needsCopy = true;
    }
  }

  if (needsCopy) {
    const asset = Asset.fromModule(
      require("../assets/db/quran.db") as number
    );
    await asset.downloadAsync();
    // Remove old copy if it exists (overwrite)
    if (dbExists) {
      await FileSystem.deleteAsync(DB_PATH, { idempotent: true });
    }
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: DB_PATH,
    });
    // Persist version marker
    await FileSystem.writeAsStringAsync(versionFile, String(BUNDLED_DB_VERSION));
  }

  return SQLite.openDatabaseAsync(DB_NAME);
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries  (all accept an open SQLiteDatabase)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all 114 surahs with a flag indicating whether verses exist. */
export async function getAllSurahs(db: SQLite.SQLiteDatabase): Promise<Surah[]> {
  return db.getAllAsync<Surah>(`
    SELECT
      s.*,
      CASE WHEN COUNT(v.id) > 0 THEN 1 ELSE 0 END AS has_content
    FROM surahs s
    LEFT JOIN verses v ON v.surah_id = s.id
    GROUP BY s.id
    ORDER BY s.number
  `);
}

/** Fetch a single surah by its number (1-114). */
export async function getSurah(
  db: SQLite.SQLiteDatabase,
  surahNumber: number
): Promise<Surah | null> {
  return db.getFirstAsync<Surah>(
    `SELECT s.*,
            CASE WHEN COUNT(v.id) > 0 THEN 1 ELSE 0 END AS has_content
     FROM surahs s
     LEFT JOIN verses v ON v.surah_id = s.id
     WHERE s.number = ?
     GROUP BY s.id`,
    surahNumber
  );
}

/** Fetch all verses for a given surah (ordered by verse_number). */
export async function getVerses(
  db: SQLite.SQLiteDatabase,
  surahId: number
): Promise<Verse[]> {
  return db.getAllAsync<Verse>(
    `SELECT * FROM verses WHERE surah_id = ? ORDER BY verse_number`,
    surahId
  );
}

/** Full-text search across Arabic, Pashto and Dari fields. */
export async function searchVerses(
  db: SQLite.SQLiteDatabase,
  query: string
): Promise<(Verse & { surah_number: number; surah_name_pashto: string })[]> {
  const like = `%${query}%`;
  return db.getAllAsync(
    `SELECT v.*, s.number as surah_number, s.name_pashto as surah_name_pashto
     FROM verses v
     JOIN surahs s ON s.id = v.surah_id
     WHERE v.arabic LIKE ? OR v.pashto LIKE ? OR v.dari LIKE ?
     ORDER BY s.number, v.verse_number
     LIMIT 100`,
    like,
    like,
    like
  );
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export async function getBookmarks(
  db: SQLite.SQLiteDatabase
): Promise<Bookmark[]> {
  return db.getAllAsync<Bookmark>(
    `SELECT * FROM bookmarks ORDER BY created_at DESC`
  );
}

export async function toggleBookmark(
  db: SQLite.SQLiteDatabase,
  surahId: number,
  verseNumber: number,
  note = ""
): Promise<boolean> {
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM bookmarks WHERE surah_id = ? AND verse_number = ?`,
    surahId,
    verseNumber
  );

  if (existing) {
    await db.runAsync(
      `DELETE FROM bookmarks WHERE surah_id = ? AND verse_number = ?`,
      surahId,
      verseNumber
    );
    return false; // removed
  } else {
    await db.runAsync(
      `INSERT INTO bookmarks (surah_id, verse_number, note) VALUES (?,?,?)`,
      surahId,
      verseNumber,
      note
    );
    return true; // added
  }
}

export async function isBookmarked(
  db: SQLite.SQLiteDatabase,
  surahId: number,
  verseNumber: number
): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM bookmarks WHERE surah_id = ? AND verse_number = ?`,
    surahId,
    verseNumber
  );
  return row !== null;
}

// ─── Last read position ───────────────────────────────────────────────────────

export async function saveLastRead(
  db: SQLite.SQLiteDatabase,
  surahId: number,
  verseNumber: number,
  juzNumber: number | null = null
): Promise<void> {
  await db.runAsync(
    `INSERT INTO last_read (id, surah_id, verse_number, juz_number)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       surah_id     = excluded.surah_id,
       verse_number = excluded.verse_number,
       juz_number   = excluded.juz_number,
       updated_at   = datetime('now')`,
    surahId,
    verseNumber,
    juzNumber
  );
}

export async function getLastRead(
  db: SQLite.SQLiteDatabase
): Promise<LastRead | null> {
  return db.getFirstAsync<LastRead>(
    `SELECT surah_id, verse_number, juz_number FROM last_read WHERE id = 1`
  );
}

// ─── Juz (Para) ──────────────────────────────────────────────────────────────

/** Fetch all 30 juz with the starting surah name. */
export async function getAllJuz(db: SQLite.SQLiteDatabase): Promise<Juz[]> {
  return db.getAllAsync<Juz>(`
    SELECT j.*, s.name_arabic AS start_surah_name
    FROM juz j
    JOIN surahs s ON s.number = j.start_surah
    ORDER BY j.number
  `);
}

/** Fetch all verses belonging to a given juz number. */
export async function getVersesByJuz(
  db: SQLite.SQLiteDatabase,
  juzNumber: number
): Promise<(Verse & { surah_number: number; surah_name_arabic: string })[]> {
  return db.getAllAsync(
    `SELECT v.*, s.number AS surah_number, s.name_arabic AS surah_name_arabic
     FROM verses v
     JOIN surahs s ON s.id = v.surah_id
     JOIN juz j ON j.number = ?
     WHERE v.verse_number > 0
       AND (
         (s.number > j.start_surah AND s.number < j.end_surah)
         OR (s.number = j.start_surah AND v.verse_number >= j.start_verse)
         OR (s.number = j.end_surah AND v.verse_number <= j.end_verse)
       )
     ORDER BY s.number, v.verse_number`,
    juzNumber
  );
}
