import { useLocalSearchParams } from "expo-router";

import SurahsReader from "@/modules/(QURAN)/surahs/surahs-reader";

export default function SurahReaderScreen() {
  const { id, verse } = useLocalSearchParams<{ id: string; verse?: string }>();

  // Tabs reuse a mounted screen when only params change; the key forces a fresh reader.
  return (
    <SurahsReader
      key={`${id}-${verse ?? ""}`}
      surahNumber={Number(id)}
      initialVerse={verse ? Number(verse) : undefined}
    />
  );
}
