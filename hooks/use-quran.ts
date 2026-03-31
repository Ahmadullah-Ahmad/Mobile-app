/**
 * React hooks for Quran data.
 * All hooks read from the shared SQLiteDatabase that is provided via
 * QuranDatabaseProvider (see app/quran/_layout.tsx).
 */

import { loadSetting, saveSetting } from "@/lib/settings";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  Juz,
  LastRead,
  Surah,
  Verse,
  getAllJuz,
  getAllSurahs,
  getBookmarks,
  getLastRead,
  getVerses,
  getVersesByJuz,
  isBookmarked,
  saveLastRead,
  searchVerses,
  toggleBookmark,
} from "@/lib/quran-db";

// ─────────────────────────────────────────────────────────────────────────────
// Surah list
// ─────────────────────────────────────────────────────────────────────────────

export function useSurahs() {
  const db = useSQLiteContext();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAllSurahs(db)
      .then(setSurahs)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [db]);

  return { surahs, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verses for one surah
// ─────────────────────────────────────────────────────────────────────────────

export function useVerses(surahId: number) {
  const db = useSQLiteContext();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    getVerses(db, surahId)
      .then(setVerses)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [db, surahId]);

  return { verses, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────────────────────

export function useSearch() {
  const db = useSQLiteContext();
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
  const db = useSQLiteContext();
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
  const db = useSQLiteContext();
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
  const db = useSQLiteContext();
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    getLastRead(db).then(setLastRead);
  }, [db]);

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
// Translation language preference (in-memory, not persisted to DB)
// ─────────────────────────────────────────────────────────────────────────────

export type TranslationLang = "pashto" | "dari" | "both" | "none";

// ─────────────────────────────────────────────────────────────────────────────
// Juz (Para) list
// ─────────────────────────────────────────────────────────────────────────────

export function useJuzList() {
  const db = useSQLiteContext();
  const [juzList, setJuzList] = useState<Juz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllJuz(db)
      .then(setJuzList)
      .finally(() => setLoading(false));
  }, [db]);

  return { juzList, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// Verses for one juz
// ─────────────────────────────────────────────────────────────────────────────

export function useJuzVerses(juzNumber: number) {
  const db = useSQLiteContext();
  const [verses, setVerses] = useState<
    Awaited<ReturnType<typeof getVersesByJuz>>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (juzNumber < 1) return;
    setLoading(true);
    getVersesByJuz(db, juzNumber)
      .then(setVerses)
      .finally(() => setLoading(false));
  }, [db, juzNumber]);

  return { verses, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation language preference (in-memory, not persisted to DB)
// ─────────────────────────────────────────────────────────────────────────────

export function useTranslationLang(initial: TranslationLang = "pashto") {
  const [lang, setLangState] = useState<TranslationLang>(initial);

  useEffect(() => {
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
