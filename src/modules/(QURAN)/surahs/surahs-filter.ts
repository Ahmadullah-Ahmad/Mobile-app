import { toArabicNumeral } from "@/lib/utils";

import type { Surah } from "./surahs-config";

export function filterSurahs(surahs: Surah[], query: string): Surah[] {
  const needle = query.trim();
  if (!needle) return surahs;
  const lower = needle.toLowerCase();
  return surahs.filter(
    (s) =>
      s.name_arabic.includes(needle) ||
      s.name_pashto.includes(needle) ||
      s.name_dari.includes(needle) ||
      s.name_transliteration.toLowerCase().includes(lower) ||
      String(s.number).includes(needle) ||
      toArabicNumeral(s.number).includes(needle)
  );
}
