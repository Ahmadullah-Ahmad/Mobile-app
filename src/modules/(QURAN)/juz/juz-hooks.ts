import { useSyncQuery } from "@/hooks/use-sync-query";

import type { Juz, JuzVerse } from "./juz-config";

export function useGetAllJuz() {
  const juzList = useSyncQuery(
    "readJuzList",
    (sqlite) =>
      sqlite.getAllSync<Juz>(
        `SELECT j.number, j.start_surah, j.start_verse, j.end_surah, j.end_verse,
                j.name_arabic, j.name_pashto, j.name_dari,
                s.name_arabic AS start_surah_name
         FROM juz j
         JOIN surahs s ON s.number = j.start_surah
         ORDER BY j.number`
      ),
    []
  );
  return { juzList };
}

export function useGetJuzVerses(juzNumber: number) {
  const verses = useSyncQuery(
    `readJuzVerses(juz ${juzNumber})`,
    (sqlite): JuzVerse[] =>
      juzNumber < 1
        ? []
        : sqlite.getAllSync<JuzVerse>(
            `SELECT v.id, v.surah_id, v.verse_number, v.arabic, v.pashto, v.dari,
                    v.juz_number, s.number AS surah_number,
                    s.name_arabic AS surah_name_arabic
             FROM verses v
             JOIN surahs s ON s.id = v.surah_id
             WHERE v.juz_number = ?
             ORDER BY s.number, v.verse_number`,
            juzNumber
          ),
    [juzNumber]
  );
  return { verses };
}
