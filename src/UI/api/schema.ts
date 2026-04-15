/**
 * Drizzle ORM schema for the Quran database.
 *
 * The DB is pre-seeded from `assets/db/app.db`, so these definitions are
 * used purely for type-safe query building (no migrations are run at runtime).
 */

import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── surahs ──────────────────────────────────────────────────────────────────
export const surahs = sqliteTable("surahs", {
  id: integer("id").primaryKey(),
  number: integer("number").notNull().unique(),
  nameArabic: text("name_arabic").notNull(),
  namePashto: text("name_pashto").notNull().default(""),
  nameDari: text("name_dari").notNull().default(""),
  nameTransliteration: text("name_transliteration").notNull().default(""),
  totalVerses: integer("total_verses").notNull().default(0),
  revelationType: text("revelation_type", { enum: ["meccan", "medinan"] })
    .notNull()
    .default("meccan"),
});

// ─── verses ──────────────────────────────────────────────────────────────────
export const verses = sqliteTable(
  "verses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    surahId: integer("surah_id")
      .notNull()
      .references(() => surahs.id),
    verseNumber: integer("verse_number").notNull(),
    arabic: text("arabic").notNull().default(""),
    pashto: text("pashto").notNull().default(""),
    dari: text("dari").notNull().default(""),
  },
  (t) => ({
    surahVerseUnique: uniqueIndex("verses_surah_verse_unique").on(
      t.surahId,
      t.verseNumber
    ),
  })
);

// ─── bookmarks ───────────────────────────────────────────────────────────────
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    surahId: integer("surah_id")
      .notNull()
      .references(() => surahs.id),
    verseNumber: integer("verse_number").notNull(),
    note: text("note").default(""),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
  },
  (t) => ({
    surahVerseUnique: uniqueIndex("bookmarks_surah_verse_unique").on(
      t.surahId,
      t.verseNumber
    ),
  })
);

// ─── last_read ───────────────────────────────────────────────────────────────
export const lastRead = sqliteTable("last_read", {
  id: integer("id").primaryKey(),
  surahId: integer("surah_id")
    .notNull()
    .references(() => surahs.id),
  verseNumber: integer("verse_number").notNull().default(1),
  juzNumber: integer("juz_number"),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── juz ─────────────────────────────────────────────────────────────────────
export const juz = sqliteTable("juz", {
  number: integer("number").primaryKey(),
  startSurah: integer("start_surah").notNull(),
  startVerse: integer("start_verse").notNull(),
  endSurah: integer("end_surah").notNull(),
  endVerse: integer("end_verse").notNull(),
  nameArabic: text("name_arabic").notNull().default(""),
  namePashto: text("name_pashto").notNull().default(""),
  nameDari: text("name_dari").notNull().default(""),
});

// ─── Inferred row types ──────────────────────────────────────────────────────
export type SurahRow = typeof surahs.$inferSelect;
export type VerseRow = typeof verses.$inferSelect;
export type BookmarkRow = typeof bookmarks.$inferSelect;
export type LastReadRow = typeof lastRead.$inferSelect;
export type JuzRow = typeof juz.$inferSelect;
