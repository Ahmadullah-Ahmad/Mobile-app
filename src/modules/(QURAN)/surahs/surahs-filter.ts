import type { Surah } from "./surahs-config";

export function filterSurahs(surahs: Surah[], query: string): Surah[] {
  if (!query.trim()) return surahs;
  const lower = query.toLowerCase();
  return surahs.filter(
    (s) =>
      s.name_arabic.includes(query) ||
      s.name_pashto.includes(query) ||
      s.name_transliteration.toLowerCase().includes(lower) ||
      String(s.number).includes(query)
  );
}
