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
