import { loadSetting, saveSetting } from "@/lib/settings";
import { getDb, seedDatabase } from "@/UI";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Directory, Paths } from "expo-file-system";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import migrations from "~/drizzle/migrations";

// ── Bump this string whenever you regenerate assets/db/quran.db ──────────────
const DB_VERSION = "6"; // v6: Drizzle ORM + seed

/**
 * Set to true  → run Drizzle migrations before seeding (for a fresh/empty DB).
 * Set to false → skip migrations and go straight to seed   (asset DB already
 *                has the correct schema — this is the normal production path).
 *
 * When should you set this to true?
 *   • You wiped the asset DB and want a clean schema applied on first launch.
 *   • You added a new migration (schema change) and want it applied on device.
 * Remember to also bump DB_VERSION above so devices re-copy the asset DB first.
 */
const RUN_MIGRATIONS = false;

function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#166534" />
    </View>
  );
}

// ── With migrations ───────────────────────────────────────────────────────────

function DbProviderWithMigrations({ children }: { children: React.ReactNode }) {
  const sqlite = useSQLiteContext();
  const db = getDb(sqlite);
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!success) return;
    seedDatabase(db)
      .then(() => setSeeded(true))
      .catch((e) => {
        console.error("Seed failed:", e);
        setSeeded(true); // still render — partial data is better than spinner
      });
  }, [success]);

  if (error) {
    console.error("Migration failed:", error);
    // Fall through and render anyway — asset DB schema may already be correct
    return <>{children}</>;
  }

  if (!success || !seeded) return <Loading />;
  return <>{children}</>;
}

// ── Without migrations (default) ─────────────────────────────────────────────

function DbProviderSeedOnly({ children }: { children: React.ReactNode }) {
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

const DbProvider = RUN_MIGRATIONS ? DbProviderWithMigrations : DbProviderSeedOnly;

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
    <Suspense fallback={<Loading />}>
      <SQLiteProvider
        databaseName="quran.db"
        assetSource={{ assetId: require("../../assets/db/quran.db") }}
        useSuspense
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
    </Suspense>
  );
}
