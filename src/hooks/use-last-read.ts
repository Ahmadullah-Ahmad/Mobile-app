import { sql } from "drizzle-orm";
import { useCallback } from "react";

import { useDb, type DB } from "@/db/client";
import { lastRead as lastReadTable } from "@/db/schema";
import type { LastRead } from "@/lib/common-types";
import { QUERY_KEYS } from "@/lib/query-keys";
import { invalidateQuery } from "@/lib/query-store";

import { useQueryVersion } from "./use-query-version";
import { useSyncQuery } from "./use-sync-query";

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

export function useLastRead() {
  const db = useDb();
  const version = useQueryVersion(QUERY_KEYS.LAST_READ);

  const lastRead = useSyncQuery(
    "readLastRead",
    (sqlite) =>
      sqlite.getFirstSync<LastRead>(
        `SELECT surah_id, verse_number, juz_number FROM last_read WHERE id = 1`
      ),
    [version]
  );

  const save = useCallback(
    (surahId: number, verseNumber: number, juzNumber: number | null = null) => {
      saveLastRead(db, surahId, verseNumber, juzNumber).then(() =>
        invalidateQuery(QUERY_KEYS.LAST_READ)
      );
    },
    [db]
  );

  return { lastRead, save };
}
