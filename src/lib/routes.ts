import { router } from "expo-router";

/** Every screen path in one place, so a renamed route is a one-line change. */
export const ROUTES = {
  home: "/",
  surahs: "/quran",
  juzList: "/quran/para",
  bookmarks: "/quran/bookmarks",
  settings: "/settings",
  surah: (surahNumber: number) => `/quran/${surahNumber}`,
  juz: (juzNumber: number) => `/quran/juz/${juzNumber}`,
} as const;

/**
 * Push a screen by path.
 *
 * Typed routes only accept literal paths, and the saved last-read route is a
 * runtime string, so the single cast lives here instead of at every call site.
 */
export function navigate(path: string) {
  (router.push as (href: string) => void)(path);
}
