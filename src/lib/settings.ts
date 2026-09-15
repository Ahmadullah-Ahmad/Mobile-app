import { File, Paths } from "expo-file-system";

const settingsFile = () => new File(Paths.document, "quran_settings.json");

/**
 * In-memory copy of the settings file.
 *
 * The file used to be re-read and re-parsed on every `loadSetting` call, and
 * every screen reads several settings on mount — each arriving after the first
 * render and forcing another one. The root layout reads settings before it
 * renders anything, which fills this cache, so screens can take their values
 * synchronously via `peekSetting` and render correctly the first time.
 */
let cache: Record<string, unknown> | null = null;

async function readAll(): Promise<Record<string, unknown>> {
  if (cache) return cache;
  try {
    const file = settingsFile();
    cache = file.exists ? JSON.parse(await file.text()) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

export async function loadSetting<T>(key: string): Promise<T | null> {
  const all = await readAll();
  return key in all ? (all[key] as T) : null;
}

/**
 * Read a setting synchronously from the cache.
 *
 * Returns `undefined` when the cache has not been filled yet (callers should
 * then fall back to `loadSetting`), and `null` when it is loaded but the key
 * was never saved.
 */
export function peekSetting<T>(key: string): T | null | undefined {
  if (!cache) return undefined;
  return key in cache ? (cache[key] as T) : null;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    const all = await readAll();
    all[key] = value;
    const file = settingsFile();
    // `write` on a file that has never existed is not guaranteed to create it.
    // If this silently failed, "dbVersion" would never persist and the app
    // would wipe and re-copy the bundled database on every single launch.
    if (!file.exists) file.create();
    file.write(JSON.stringify(all));
  } catch (e) {
    // Never crash on a settings write, but do not hide it during development.
    if (__DEV__) console.warn(`saveSetting("${key}") failed:`, e);
  }
}
