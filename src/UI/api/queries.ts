/**
 * Quran database – typed query helpers built on Drizzle ORM.
 *
 * The pre-seeded `assets/db/app.db` file is loaded by `SQLiteProvider`
 * (see `app/quran/_layout.tsx`); these helpers wrap that handle with
 * Drizzle so all queries are type-safe and column-name-checked at compile time.
 *
 * Public Surah/Verse/Bookmark/LastRead/Juz interfaces preserve snake_case
 * field names because UI components/hooks already consume them that way.
 */

import { and, desc, eq, gte, lte, like, or, sql } from "drizzle-orm";
import type { DB } from "./client";
import { bookmarks, juz, lastRead, surahs, verses } from "./schema";
import type { Bookmark, Juz, LastRead, Surah, Verse } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Surahs
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all 114 surahs with a flag indicating whether verses exist. */
export async function getAllSurahs(db: DB): Promise<Surah[]> {
  const rows = await db
    .select({
      id: surahs.id,
      number: surahs.number,
      name_arabic: surahs.nameArabic,
      name_pashto: surahs.namePashto,
      name_dari: surahs.nameDari,
      name_transliteration: surahs.nameTransliteration,
      total_verses: surahs.totalVerses,
      revelation_type: surahs.revelationType,
      has_content: sql<number>`CASE WHEN COUNT(${verses.id}) > 0 THEN 1 ELSE 0 END`,
    })
    .from(surahs)
    .leftJoin(verses, eq(verses.surahId, surahs.id))
    .groupBy(surahs.id)
    .orderBy(surahs.number);

  return rows.map((r) => ({ ...r, has_content: Boolean(r.has_content) })) as Surah[];
}

/** Fetch a single surah by its number (1-114). */
export async function getSurah(
  db: DB,
  surahNumber: number
): Promise<Surah | null> {
  const rows = await db
    .select({
      id: surahs.id,
      number: surahs.number,
      name_arabic: surahs.nameArabic,
      name_pashto: surahs.namePashto,
      name_dari: surahs.nameDari,
      name_transliteration: surahs.nameTransliteration,
      total_verses: surahs.totalVerses,
      revelation_type: surahs.revelationType,
      has_content: sql<number>`CASE WHEN COUNT(${verses.id}) > 0 THEN 1 ELSE 0 END`,
    })
    .from(surahs)
    .leftJoin(verses, eq(verses.surahId, surahs.id))
    .where(eq(surahs.number, surahNumber))
    .groupBy(surahs.id)
    .limit(1);

  if (rows.length === 0) return null;
  const r = rows[0];
  return { ...r, has_content: Boolean(r.has_content) } as Surah;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verses
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all verses for a given surah (ordered by verse_number). */
export async function getVerses(db: DB, surahId: number): Promise<Verse[]> {
  const rows = await db
    .select({
      id: verses.id,
      surah_id: verses.surahId,
      verse_number: verses.verseNumber,
      arabic: verses.arabic,
      pashto: verses.pashto,
      dari: verses.dari,
    })
    .from(verses)
    .where(eq(verses.surahId, surahId))
    .orderBy(verses.verseNumber);

  return rows;
}

/** Full-text search across Arabic, Pashto and Dari fields. */
export async function searchVerses(
  db: DB,
  query: string
): Promise<(Verse & { surah_number: number; surah_name_pashto: string })[]> {
  const needle = `%${query}%`;
  const rows = await db
    .select({
      id: verses.id,
      surah_id: verses.surahId,
      verse_number: verses.verseNumber,
      arabic: verses.arabic,
      pashto: verses.pashto,
      dari: verses.dari,
      surah_number: surahs.number,
      surah_name_pashto: surahs.namePashto,
    })
    .from(verses)
    .innerJoin(surahs, eq(surahs.id, verses.surahId))
    .where(
      or(
        like(verses.arabic, needle),
        like(verses.pashto, needle),
        like(verses.dari, needle)
      )
    )
    .orderBy(surahs.number, verses.verseNumber)
    .limit(100);

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bookmarks
// ─────────────────────────────────────────────────────────────────────────────

export async function getBookmarks(db: DB): Promise<Bookmark[]> {
  const rows = await db
    .select({
      id: bookmarks.id,
      surah_id: bookmarks.surahId,
      verse_number: bookmarks.verseNumber,
      note: bookmarks.note,
      created_at: bookmarks.createdAt,
    })
    .from(bookmarks)
    .orderBy(desc(bookmarks.createdAt));

  return rows.map((r) => ({
    ...r,
    note: r.note ?? "",
    created_at: r.created_at ?? "",
  }));
}

export async function toggleBookmark(
  db: DB,
  surahId: number,
  verseNumber: number,
  note = ""
): Promise<boolean> {
  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.surahId, surahId),
        eq(bookmarks.verseNumber, verseNumber)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.surahId, surahId),
          eq(bookmarks.verseNumber, verseNumber)
        )
      );
    return false; // removed
  }

  await db.insert(bookmarks).values({
    surahId,
    verseNumber,
    note,
  });
  return true; // added
}

export async function deleteBookmark(db: DB, id: number): Promise<void> {
  await db.delete(bookmarks).where(eq(bookmarks.id, id));
}

export async function isBookmarked(
  db: DB,
  surahId: number,
  verseNumber: number
): Promise<boolean> {
  const rows = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.surahId, surahId),
        eq(bookmarks.verseNumber, verseNumber)
      )
    )
    .limit(1);
  return rows.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Last read position
// ─────────────────────────────────────────────────────────────────────────────

export async function saveLastRead(
  db: DB,
  surahId: number,
  verseNumber: number,
  juzNumber: number | null = null
): Promise<void> {
  await db
    .insert(lastRead)
    .values({
      id: 1,
      surahId,
      verseNumber,
      juzNumber,
    })
    .onConflictDoUpdate({
      target: lastRead.id,
      set: {
        surahId,
        verseNumber,
        juzNumber,
        updatedAt: sql`(datetime('now'))`,
      },
    });
}

export async function getLastRead(db: DB): Promise<LastRead | null> {
  const rows = await db
    .select({
      surah_id: lastRead.surahId,
      verse_number: lastRead.verseNumber,
      juz_number: lastRead.juzNumber,
    })
    .from(lastRead)
    .where(eq(lastRead.id, 1))
    .limit(1);

  return rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Juz (Para)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all 30 juz with the starting surah name. */
export async function getAllJuz(db: DB): Promise<Juz[]> {
  const rows = await db
    .select({
      number: juz.number,
      start_surah: juz.startSurah,
      start_verse: juz.startVerse,
      end_surah: juz.endSurah,
      end_verse: juz.endVerse,
      name_arabic: juz.nameArabic,
      name_pashto: juz.namePashto,
      name_dari: juz.nameDari,
      start_surah_name: surahs.nameArabic,
    })
    .from(juz)
    .innerJoin(surahs, eq(surahs.number, juz.startSurah))
    .orderBy(juz.number);

  return rows;
}

/** Fetch all verses belonging to a given juz number. */
export async function getVersesByJuz(
  db: DB,
  juzNumber: number
): Promise<(Verse & { surah_number: number; surah_name_arabic: string })[]> {
  // Look up the juz boundaries first
  const j = await db
    .select()
    .from(juz)
    .where(eq(juz.number, juzNumber))
    .limit(1);

  if (j.length === 0) return [];
  const { startSurah, startVerse, endSurah, endVerse } = j[0];

  const rows = await db
    .select({
      id: verses.id,
      surah_id: verses.surahId,
      verse_number: verses.verseNumber,
      arabic: verses.arabic,
      pashto: verses.pashto,
      dari: verses.dari,
      surah_number: surahs.number,
      surah_name_arabic: surahs.nameArabic,
    })
    .from(verses)
    .innerJoin(surahs, eq(surahs.id, verses.surahId))
    .where(
      and(
        gte(verses.verseNumber, 1),
        or(
          // Surahs strictly between start and end → all verses
          and(
            sql`${surahs.number} > ${startSurah}`,
            sql`${surahs.number} < ${endSurah}`
          ),
          // Start surah → verses from startVerse onward
          and(eq(surahs.number, startSurah), gte(verses.verseNumber, startVerse)),
          // End surah → verses up to endVerse
          and(eq(surahs.number, endSurah), lte(verses.verseNumber, endVerse))
        )
      )
    )
    .orderBy(surahs.number, verses.verseNumber);

  return rows;
}
