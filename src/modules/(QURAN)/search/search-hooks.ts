import { eq, like, or } from "drizzle-orm";
import { useCallback, useState } from "react";

import { useDb, type DB } from "@/db/client";
import { surahs, verses } from "@/db/schema";
import type { Verse } from "@/lib/common-types";

export type VerseSearchResult = Verse & {
  surah_number: number;
  surah_name_pashto: string;
};

const MAX_RESULTS = 100;

async function searchVerses(db: DB, query: string): Promise<VerseSearchResult[]> {
  const needle = `%${query}%`;
  return db
    .select({
      id: verses.id,
      surah_id: verses.surahId,
      verse_number: verses.verseNumber,
      arabic: verses.arabic,
      pashto: verses.pashto,
      dari: verses.dari,
      juz_number: verses.juzNumber,
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
    .limit(MAX_RESULTS);
}

export function useSearchVerses() {
  const db = useDb();
  const [results, setResults] = useState<VerseSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        setResults(await searchVerses(db, trimmed));
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  return { results, loading, search };
}
