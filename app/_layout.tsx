import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Allow per-component RTL on Android (writingDirection style).
I18nManager.allowRTL(true);
import {
  SafeAreaProvider,
  initialWindowMetrics
} from 'react-native-safe-area-context';
import { Directory, Paths } from 'expo-file-system';
import { useFonts } from 'expo-font';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { ThemeProvider, useTheme } from '@/theme';
import { UiLangProvider } from '@/lib/i18n-provider';
import { loadSetting, saveSetting } from '@/lib/settings';
import { getDb, seedDatabase } from '@/UI';
import View from '@/components/ui/view';
import './global.css';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Unable to activate keep awake']);

SplashScreen.preventAutoHideAsync();

// ── Bump this string whenever you regenerate assets/db/app.db ────────────────
const DB_VERSION = '8'; // v8: Pashto translation imported for all 114 surahs

/**
 * Seeds the database only when it is actually empty.
 *
 * The bundled asset already carries all 114 surahs and 30 juz, so the check
 * resolves synchronously and children render on the very first pass — no
 * spinner. The async seed only runs for a genuinely empty database.
 */
function SeedGate({ children }: { children: React.ReactNode }) {
  const sqlite = useSQLiteContext();
  const [ready, setReady] = useState(() => {
    try {
      return sqlite.getFirstSync('SELECT id FROM surahs LIMIT 1') != null;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (ready) return;
    seedDatabase(getDb(sqlite))
      .catch((e) => console.error('Seed failed:', e))
      .finally(() => setReady(true));
  }, [ready, sqlite]);

  if (!ready) return null;
  return <>{children}</>;
}

/** Hides the splash only once fonts *and* the database are ready. */
function SplashGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return <>{children}</>;
}

function DrizzleStudio() {
  const db = useSQLiteContext();
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks
    require('expo-drizzle-studio-plugin').useDrizzleStudio(db);
  }
  return null;
}

/** Inner shell — lives inside ThemeProvider so it can read the current theme */
function ThemedApp() {
  const { theme } = useTheme();

  return (
    <View className="flex-1">
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'AmiriQuran': require('../assets/fonts/AmiriQuran.ttf'),
    'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
  });

  // Wipe the SQLite directory when the bundled DB has been regenerated, so
  // SQLiteProvider re-copies the asset cleanly (and drops stale WAL/SHM files).
  const [dbVersionChecked, setDbVersionChecked] = useState(false);
  useEffect(() => {
    (async () => {
      const saved = await loadSetting<string>('dbVersion');
      if (saved !== DB_VERSION) {
        const sqliteDir = new Directory(Paths.document, 'SQLite');
        if (sqliteDir.exists) {
          try { sqliteDir.delete(); } catch { }
        }
        await saveSetting('dbVersion', DB_VERSION);
      }
      setDbVersionChecked(true);
    })();
  }, []);

  // The splash screen covers this, so returning null shows no blank frame.
  if (!fontsLoaded || !dbVersionChecked) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider defaultTheme="system">
          <UiLangProvider>
            {/* The database is opened once here, for the whole app lifetime.
                Keeping it above the router means navigating in and out of the
                Quran stack never reopens or reseeds it. */}
            <Suspense fallback={null}>
              <SQLiteProvider
                databaseName="app.db"
                assetSource={{ assetId: require('../assets/db/app.db') }}
                useSuspense
                onInit={async (db) => {
                  await db.execAsync('PRAGMA journal_mode = WAL;');
                  await db.execAsync('PRAGMA foreign_keys = ON;');
                }}
              >
                <DrizzleStudio />
                <SeedGate>
                  <SplashGate>
                    <ThemedApp />
                  </SplashGate>
                </SeedGate>
              </SQLiteProvider>
            </Suspense>
          </UiLangProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
