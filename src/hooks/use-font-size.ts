import { useCallback } from "react";

import { usePersistedSetting } from "./use-persisted-setting";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 18;
export const FONT_SIZE_STEP = 2;

const isNumber = (value: unknown): value is number => typeof value === "number";

/** Verse text size, clamped to the allowed range and saved across launches. */
export function useFontSize() {
  const [fontSize, saveFontSize] = usePersistedSetting(
    "fontSize",
    DEFAULT_FONT_SIZE,
    isNumber
  );

  const setFontSize = useCallback(
    (next: number) =>
      saveFontSize(Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, next))),
    [saveFontSize]
  );
  const increase = useCallback(
    () => setFontSize(fontSize + FONT_SIZE_STEP),
    [fontSize, setFontSize]
  );
  const decrease = useCallback(
    () => setFontSize(fontSize - FONT_SIZE_STEP),
    [fontSize, setFontSize]
  );

  return { fontSize, setFontSize, increase, decrease };
}
