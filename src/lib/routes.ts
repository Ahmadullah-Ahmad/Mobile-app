import { router } from "expo-router";

export const ROUTES = {
  home: "/",
  surahs: "/quran",
  juzList: "/quran/para",
  surah: (surahNumber: number, verse?: number) =>
    verse ? `/quran/${surahNumber}?verse=${verse}` : `/quran/${surahNumber}`,
  juz: (juzNumber: number) => `/quran/juz/${juzNumber}`,
} as const;

// Typed routes only accept literal paths; runtime-built paths need this one cast.
export function navigate(path: string) {
  (router.navigate as (href: string) => void)(path);
}
