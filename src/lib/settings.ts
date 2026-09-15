import { File, Paths } from "expo-file-system";

const settingsFile = () => new File(Paths.document, "quran_settings.json");
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

export function peekSetting<T>(key: string): T | null | undefined {
  if (!cache) return undefined;
  return key in cache ? (cache[key] as T) : null;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    const all = await readAll();
    all[key] = value;
    const file = settingsFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(all));
  } catch (e) {
    if (__DEV__) console.warn(`saveSetting("${key}") failed:`, e);
  }
}
