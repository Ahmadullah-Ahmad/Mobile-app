import { loadSetting, saveSetting } from "@/lib/settings";
import { getDb, seedDatabase } from "@/UI";
import { Directory, Paths } from "expo-file-system";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// ── Bump this string whenever you regenerate assets/db/quran.db ──────────────
const DB_VERSION = "6"; // v6: Drizzle ORM + seed

function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#166534" />
    </View>
  );
}

// ── DB provider: seed only (asset DB already has the correct schema) ────────

function DbProvider({ children }: { children: React.ReactNode }) {
  const sqlite = useSQLiteContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const db = getDb(sqlite);
    seedDatabase(db)
      .then(() => setReady(true))
      .catch((e) => {
        console.error("Seed failed:", e);
        setReady(true);
      });
  }, [sqlite]);

  if (!ready) return <Loading />;
  return <>{children}</>;
}

// ── Studio (dev only) ─────────────────────────────────────────────────────────

function DrizzleStudio() {
  const db = useSQLiteContext();
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks
    require("expo-drizzle-studio-plugin").useDrizzleStudio(db);
  }
  return null;
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function QuranLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadSetting<string>("dbVersion");
      if (saved !== DB_VERSION) {
        // Wipe the entire SQLite directory so SQLiteProvider re-copies the
        // bundled asset cleanly — removes any corrupted WAL/SHM files.
        const sqliteDir = new Directory(Paths.document, "SQLite");
        if (sqliteDir.exists) {
          try { sqliteDir.delete(); } catch { }
        }
        await saveSetting("dbVersion", DB_VERSION);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return <Loading />;

  return (
    <SQLiteProvider
      databaseName="quran.db"
      assetSource={{ assetId: require("../../assets/db/quran.db") }}
      onInit={async (db) => {
        await db.execAsync("PRAGMA journal_mode = WAL;");
        await db.execAsync("PRAGMA foreign_keys = ON;");
      }}
    >
      <DrizzleStudio />
      <DbProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "slide_from_right",
          }}
        />
      </DbProvider>
    </SQLiteProvider>
  );
}
