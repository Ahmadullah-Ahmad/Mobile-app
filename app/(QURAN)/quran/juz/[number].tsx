import { useLocalSearchParams } from "expo-router";

import JuzReader from "@/modules/(QURAN)/juz/juz-reader";

export default function JuzReaderScreen() {
  const { number, end } = useLocalSearchParams<{ number: string; end?: string }>();
  return <JuzReader key={number} juzNumber={Number(number)} startAtEnd={end === "1"} />;
}
