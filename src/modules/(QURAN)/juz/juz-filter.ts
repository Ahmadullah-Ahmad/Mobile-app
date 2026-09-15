import type { Juz, JuzSurahGroup, JuzVerse } from "./juz-config";

export function filterJuz(juzList: Juz[], query: string): Juz[] {
  if (!query.trim()) return juzList;
  return juzList.filter(
    (j) => j.name_arabic.includes(query) || String(j.number).includes(query)
  );
}

export function groupVersesBySurah(verses: JuzVerse[]): JuzSurahGroup[] {
  const groups: JuzSurahGroup[] = [];
  for (const verse of verses) {
    const last = groups[groups.length - 1];
    if (last?.surah_number === verse.surah_number) {
      last.items.push(verse);
    } else {
      groups.push({
        surah_number: verse.surah_number,
        surah_name_arabic: verse.surah_name_arabic,
        items: [verse],
      });
    }
  }
  return groups;
}
