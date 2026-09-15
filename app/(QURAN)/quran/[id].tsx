import { useLocalSearchParams } from "expo-router";

import SurahsReader from "@/modules/(QURAN)/surahs/surahs-reader";

export default function SurahReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SurahsReader surahNumber={Number(id)} />;
}
