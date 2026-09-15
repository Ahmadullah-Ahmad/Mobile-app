import { useSyncQuery } from "@/hooks/use-sync-query";
import type { Verse } from "@/lib/common-types";

import type { Surah } from "./surahs-config";

const SURAH_COLUMNS = `
  id, number, name_arabic, name_pashto, name_dari,
  name_transliteration, total_verses, revelation_type
`;

const VERSE_COLUMNS = `
  id, surah_id, verse_number, arabic, pashto, dari, juz_number
`;

type SurahRow = Omit<Surah, "has_content">;

// Every surah in the shipped database has verses.
const withContent = (row: SurahRow): Surah => ({ ...row, has_content: true });

export function useGetAllSurahs() {
  const surahs = useSyncQuery(
    "readSurahs",
    (sqlite) =>
      sqlite
        .getAllSync<SurahRow>(`SELECT ${SURAH_COLUMNS} FROM surahs ORDER BY number`)
        .map(withContent),
    []
  );
  return { surahs };
}

export function useGetSurahWithVerses(surahNumber: number) {
  return useSyncQuery(
    `readSurah(${surahNumber})`,
    (sqlite) => {
      const row = sqlite.getFirstSync<SurahRow>(
        `SELECT ${SURAH_COLUMNS} FROM surahs WHERE number = ?`,
        surahNumber
      );
      const surah = row ? withContent(row) : null;
      const verses = surah
        ? sqlite.getAllSync<Verse>(
            `SELECT ${VERSE_COLUMNS} FROM verses WHERE surah_id = ? ORDER BY verse_number`,
            surah.id
          )
        : [];
      return { surah, verses };
    },
    [surahNumber]
  );
}
