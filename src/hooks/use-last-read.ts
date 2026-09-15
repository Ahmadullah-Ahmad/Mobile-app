import { sql } from "drizzle-orm";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { useDb, type DB } from "@/db/client";
import { lastRead as lastReadTable } from "@/db/schema";
import { timedRead } from "@/db/sync-read";
import type { LastRead } from "@/lib/common-types";
import { ROUTES } from "@/lib/routes";
import { saveSetting } from "@/lib/settings";

async function saveLastRead(
  db: DB,
  surahId: number,
  verseNumber: number,
  juzNumber: number | null
): Promise<void> {
  await db
    .insert(lastReadTable)
    .values({ id: 1, surahId, verseNumber, juzNumber })
    .onConflictDoUpdate({
      target: lastReadTable.id,
      set: {
        surahId,
        verseNumber,
        juzNumber,
        updatedAt: sql`(datetime('now'))`,
      },
    });
}

/**
 * The saved reading position, shared by the surah list and both readers.
 *
 * `save` also stores the matching route for the home screen's
 * "continue reading" card, which renders outside the database context.
 */
export function useLastRead() {
  const db = useDb();
  const sqlite = useSQLiteContext();

  // Read synchronously: an async read here landed just after the first paint
  // and re-rendered the whole screen for no visible change.
  const [lastRead, setLastRead] = useState<LastRead | null>(() =>
    timedRead("readLastRead", () =>
      sqlite.getFirstSync<LastRead>(
        `SELECT surah_id, verse_number, juz_number FROM last_read WHERE id = 1`
      )
    )
  );

  const save = useCallback(
    (surahId: number, verseNumber: number, juzNumber: number | null = null) => {
      saveLastRead(db, surahId, verseNumber, juzNumber).then(() => {
        setLastRead({
          surah_id: surahId,
          verse_number: verseNumber,
          juz_number: juzNumber,
        });
        saveSetting(
          "lastReadRoute",
          juzNumber ? ROUTES.juz(juzNumber) : ROUTES.surah(surahId)
        );
      });
    },
    [db]
  );

  return { lastRead, save };
}
