import { useLocalSearchParams } from "expo-router";

import JuzReader from "@/modules/(QURAN)/juz/juz-reader";

export default function JuzReaderScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  return <JuzReader juzNumber={Number(number)} />;
}
