/**
 * React hooks for Quran data, over the SQLiteDatabase provided by
 * SQLiteProvider in app/_layout.tsx.
 *
 * Anything a screen needs for its first paint — surah list, juz list, verses,
 * last-read position, saved settings — is read synchronously (../api/sync-reads
 * and the settings cache), so it exists on the first render. Values that arrive
 * a render late force a second full render of the page, which is what made
 * opening a surah stutter.
 *
 * Writes and on-demand reads — bookmarks, search — go through Drizzle in
 * ../api/queries, where an extra frame costs nothing.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { loadSetting, peekSetting, saveSetting } from "@/lib/settings";
import { useDb } from "../api/client";
import {
  readJuzList,
  readJuzVerses,
  readLastRead,
  readSurah,
  readSurahs,
  readVerses,
} from "../api/sync-reads";
import {
  getBookmarks,
  isBookmarked,
  saveLastRead,
  searchVerses,
  toggleBookmark,
} from "../api/queries";
import type { Bookmark, LastRead, TranslationLang } from "../api/types";

// ─────────────────────────────────────────────────────────────────────────────
// Surah list
// ─────────────────────────────────────────────────────────────────────────────

/** All 114 surahs. Read synchronously, so `loading` is never true. */
export function useSurahs() {
  const sqlite = useSQLiteContext();
  const surahs = useMemo(() => readSurahs(sqlite), [sqlite]);
  return { surahs, loading: false, error: null as Error | null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verses for one surah
// ─────────────────────────────────────────────────────────────────────────────
export const FIRST_CHUNK = 20;

/** Every verse of a surah. Read synchronously, so `loading` is never true. */
export function useVerses(surahId: number) {
  const sqlite = useSQLiteContext();
  const verses = useMemo(
    () => (surahId === 0 ? [] : readVerses(sqlite, surahId)),
    [sqlite, surahId]
  );
  return { verses, loading: false, error: null as Error | null };
}

/**
 * Surah metadata plus its verses, both read synchronously from the surah
 * *number*. Replaces the old two-step load (metadata, then verses keyed on the
 * resolved id), which needed two async round-trips before the reader could
 * paint anything.
 */
export function useSurahReader(surahNumber: number) {
  const sqlite = useSQLiteContext();
  return useMemo(() => {
    const surah = readSurah(sqlite, surahNumber);
    return {
      surah,
      verses: surah ? readVerses(sqlite, surah.id) : [],
      loading: false,
    };
  }, [sqlite, surahNumber]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────────────

export function useSearch() {
  const db = useDb();
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof searchVerses>>
  >([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const rows = await searchVerses(db, query.trim());
        setResults(rows);
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  return { results, loading, search };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bookmark for a single verse
// ─────────────────────────────────────────────────────────────────────────────

export function useBookmark(surahId: number, verseNumber: number) {
  const db = useDb();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    isBookmarked(db, surahId, verseNumber).then(setBookmarked);
  }, [db, surahId, verseNumber]);

  const toggle = useCallback(async () => {
    const added = await toggleBookmark(db, surahId, verseNumber);
    setBookmarked(added);
    return added;
  }, [db, surahId, verseNumber]);

  return { bookmarked, toggle };
}

// ─────────────────────────────────────────────────────────────────────────────
// All bookmarks
// ─────────────────────────────────────────────────────────────────────────────

export function useBookmarks() {
  const db = useDb();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getBookmarks(db).then(setBookmarks).finally(() => setLoading(false));
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bookmarks, loading, refresh };
}

// ─────────────────────────────────────────────────────────────────────────────
// Last read position
// ─────────────────────────────────────────────────────────────────────────────

export function useLastRead() {
  const db = useDb();
  const sqlite = useSQLiteContext();
  // Read synchronously: an async read here landed just after the first paint
  // and re-rendered the whole screen for no visible change.
  const [lastRead, setLastRead] = useState<LastRead | null>(() =>
    readLastRead(sqlite)
  );

  const save = useCallback(
    (surahId: number, verseNumber: number, juzNumber: number | null = null) => {
      saveLastRead(db, surahId, verseNumber, juzNumber).then(() => {
        setLastRead({ surah_id: surahId, verse_number: verseNumber, juz_number: juzNumber });
        // Also persist the route for the home screen (outside SQLite context)
        const route = juzNumber
          ? `/quran/juz/${juzNumber}`
          : `/quran/${surahId}`;
        saveSetting("lastReadRoute", route);
      });
    },
    [db]
  );

  return { lastRead, save };
}

// ─────────────────────────────────────────────────────────────────────────────
// Juz (Para) list
// ─────────────────────────────────────────────────────────────────────────────

/** All 30 juz. Read synchronously, so `loading` is never true. */
export function useJuzList() {
  const sqlite = useSQLiteContext();
  const juzList = useMemo(() => readJuzList(sqlite), [sqlite]);
  return { juzList, loading: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verses for one juz
// ─────────────────────────────────────────────────────────────────────────────

/** Every verse of a juz. Read synchronously, so `loading` is never true. */
export function useJuzVerses(juzNumber: number) {
  const sqlite = useSQLiteContext();
  const verses = useMemo(
    () => (juzNumber < 1 ? [] : readJuzVerses(sqlite, juzNumber)),
    [sqlite, juzNumber]
  );
  return { verses, loading: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation language preference (in-memory, not persisted to DB)
// ─────────────────────────────────────────────────────────────────────────────

export function useTranslationLang(initial: TranslationLang = "pashto") {
  // Take the saved language from the settings cache so the first render is
  // already correct — "none" uses 15 verses per page instead of 10, so a late
  // value re-chunked and re-rendered every page.
  const [lang, setLangState] = useState<TranslationLang>(
    () => peekSetting<TranslationLang>("lang") ?? initial
  );

  useEffect(() => {
    if (peekSetting("lang") !== undefined) return; // cache already applied
    loadSetting<TranslationLang>("lang").then((saved) => {
      if (saved) setLangState(saved);
    });
  }, []);

  const setLang = useCallback((newLang: TranslationLang) => {
    setLangState(newLang);
    saveSetting("lang", newLang);
  }, []);

  return { lang, setLang };
}
