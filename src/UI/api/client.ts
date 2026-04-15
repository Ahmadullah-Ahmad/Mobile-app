/**
 * Drizzle database access.
 *
 * The expo-sqlite database is provisioned by `SQLiteProvider` (see
 * `app/quran/_layout.tsx`); this module wraps it with Drizzle so the rest
 * of the app can run type-safe queries against the schema.
 */

import { useMemo } from "react";
import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "./schema";

export type DB = ExpoSQLiteDatabase<typeof schema>;

/** Wrap a raw expo-sqlite handle with Drizzle. */
export function getDb(sqlite: SQLiteDatabase): DB {
  return drizzle(sqlite, { schema });
}

/** React hook returning a Drizzle-wrapped DB from the SQLite context. */
export function useDb(): DB {
  const sqlite = useSQLiteContext();
  return useMemo(() => getDb(sqlite), [sqlite]);
}
