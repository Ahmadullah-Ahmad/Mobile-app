import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useMemo, type DependencyList } from "react";

import { timedRead } from "@/db/sync-read";

/**
 * Runs a synchronous SQLite read during render and memoizes the result.
 *
 * This is the shared shape behind every list and reader data hook: the data
 * exists on the first render, so screens never show a loading state and never
 * render twice when the data lands.
 *
 * @param label Shown in the dev log when the read is slow.
 * @param read  Reads from the database; re-runs when `deps` change.
 */
export function useSyncQuery<T>(
  label: string,
  read: (sqlite: SQLiteDatabase) => T,
  deps: DependencyList
): T {
  const sqlite = useSQLiteContext();
  return useMemo(
    () => timedRead(label, () => read(sqlite)),
    // `label` and `read` are rebuilt every render; `deps` is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sqlite, ...deps]
  );
}
