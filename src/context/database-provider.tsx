import { SplashScreen } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { getDb } from "@/db/client";
import { seedDatabase } from "@/db/seed";

// The bundled asset already carries all surahs and juz, so this check resolves
// synchronously and children render on the first pass. The async seed only
// runs for a genuinely empty database.
function SeedGate({ children }: { children: ReactNode }) {
  const sqlite = useSQLiteContext();
  const [ready, setReady] = useState(() => {
    try {
      return sqlite.getFirstSync("SELECT id FROM surahs LIMIT 1") != null;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (ready) return;
    seedDatabase(getDb(sqlite))
      .catch((e) => console.error("Seed failed:", e))
      .finally(() => setReady(true));
  }, [ready, sqlite]);

  if (!ready) return null;
  return <>{children}</>;
}

function SplashGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return <>{children}</>;
}

function DrizzleStudio() {
  const db = useSQLiteContext();
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("expo-drizzle-studio-plugin").useDrizzleStudio(db);
  }
  return null;
}

// Opened once above the router: a route layout unmounts when you leave its
// stack, which reopened and reseeded the database on every entry.
export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SQLiteProvider
        databaseName="app.db"
        assetSource={{ assetId: require("../../assets/db/app.db") }}
        useSuspense
        onInit={async (db) => {
          await db.execAsync("PRAGMA journal_mode = WAL;");
          await db.execAsync("PRAGMA foreign_keys = ON;");
        }}
      >
        <DrizzleStudio />
        <SeedGate>
          <SplashGate>{children}</SplashGate>
        </SeedGate>
      </SQLiteProvider>
    </Suspense>
  );
}
