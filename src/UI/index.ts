/**
 * Quran feature — public barrel.
 *
 * Anything outside `src/features/quran/` should import from here:
 *
 *   import { useSurahs, VerseCard, type Verse } from "@/features/quran";
 *
 * This keeps the feature's internal layout free to evolve without breaking
 * call sites across the app.
 */

export * from "./api";
export * from "./hooks";
export * from "./components";
export * from "./lib/constants";
