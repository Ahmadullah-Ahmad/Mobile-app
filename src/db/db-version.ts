import { Directory, Paths } from "expo-file-system";

import { loadSetting, saveSetting } from "@/lib/settings";

export const DB_VERSION = "9";

export async function resetDatabaseIfOutdated(): Promise<void> {
  const saved = await loadSetting<string>("dbVersion");
  if (saved === DB_VERSION) return;

  const sqliteDir = new Directory(Paths.document, "SQLite");
  if (sqliteDir.exists) {
    try {
      sqliteDir.delete();
    } catch {
    }
  }
  await saveSetting("dbVersion", DB_VERSION);
}
