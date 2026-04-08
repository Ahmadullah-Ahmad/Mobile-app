/**
 * Public API of the Quran data layer.
 *
 * Routes/components/hooks should import from `@/features/quran` (the feature
 * barrel) rather than reaching into `./api` directly. This file exists so the
 * feature barrel has a single, stable surface to re-export.
 */

export * from "./types";
export { getDb, useDb, type DB } from "./client";
export {
  getAllSurahs,
  getSurah,
  getVerses,
  searchVerses,
  getBookmarks,
  toggleBookmark,
  isBookmarked,
  saveLastRead,
  getLastRead,
  getAllJuz,
  getVersesByJuz,
} from "./queries";
export { seedDatabase } from "./seed";
