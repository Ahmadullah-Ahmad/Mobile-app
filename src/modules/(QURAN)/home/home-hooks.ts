import { useLastRead } from "@/hooks/use-last-read";
import { useSyncQuery } from "@/hooks/use-sync-query";
import { FIRST_SURAH } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

import type { ContinueReading } from "./home-config";

export function useContinueReading(): ContinueReading {
  const { lastRead } = useLastRead();
  const surahId = lastRead?.surah_id ?? FIRST_SURAH;
  const verseNumber = lastRead?.verse_number ?? 1;
  const lastJuz = lastRead?.juz_number ?? null;

  return useSyncQuery(
    `readContinueReading(${surahId}:${verseNumber})`,
    (sqlite) => {
      const surah = sqlite.getFirstSync<NonNullable<ContinueReading["surah"]>>(
        `SELECT id, number, name_arabic, total_verses FROM surahs WHERE id = ?`,
        surahId
      );
      const verse = sqlite.getFirstSync<{ juz_number: number | null }>(
        `SELECT juz_number FROM verses WHERE surah_id = ? AND verse_number = ?`,
        surahId,
        verseNumber
      );
      return {
        surah,
        verseNumber,
        juzNumber: lastJuz ?? verse?.juz_number ?? 1,
        route: lastJuz ? ROUTES.juz(lastJuz) : ROUTES.surah(surah?.number ?? FIRST_SURAH),
      };
    },
    [surahId, verseNumber, lastJuz]
  );
}
