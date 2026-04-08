import { File, Paths } from "expo-file-system";

const settingsFile = () => new File(Paths.document, "quran_settings.json");

async function readAll(): Promise<Record<string, unknown>> {
  try {
    const file = settingsFile();
    if (!file.exists) return {};
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function loadSetting<T>(key: string): Promise<T | null> {
  const all = await readAll();
  return key in all ? (all[key] as T) : null;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    const all = await readAll();
    all[key] = value;
    settingsFile().write(JSON.stringify(all));
  } catch {}
}
