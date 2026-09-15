import { Stack } from "expo-router";

/**
 * Quran stack.
 *
 * The database is opened once in the root layout (`app/_layout.tsx`), not here
 * — a route layout unmounts when you leave its stack, so opening and seeding
 * the database at this level re-ran on every entry and showed a spinner each
 * time the surah or juz list was opened.
 */
export default function QuranLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "slide_from_right",
      }}
    />
  );
}
