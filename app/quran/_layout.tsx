import { loadSetting, saveSetting } from "@/lib/settings";
import { File, Paths } from "expo-file-system";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// ── Bump this string whenever you regenerate assets/db/quran.db ──────────────
const DB_VERSION = "2";

function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#166534" />
    </View>
  );
}

export default function QuranLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadSetting<string>("dbVersion");
      if (saved !== DB_VERSION) {
        // Delete the cached DB so SQLiteProvider copies fresh from the asset.
        const dbFile = new File(Paths.document, "SQLite", "quran.db");
        if (dbFile.exists) dbFile.delete();
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
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "slide_from_right",
          }}
        />
      </SQLiteProvider>
    </Suspense>
  );
}
