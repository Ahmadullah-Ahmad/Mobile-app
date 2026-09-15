import { useCallback } from "react";

import { usePersistedSetting } from "./use-persisted-setting";

export const MIN_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 30;
export const DEFAULT_FONT_SIZE = 18;
export const FONT_SIZE_STEP = 2;

const isNumber = (value: unknown): value is number => typeof value === "number";
const clamp = (n: number) => Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, n));

export function useFontSize() {
  const [stored, saveFontSize] = usePersistedSetting(
    "fontSize",
    DEFAULT_FONT_SIZE,
    isNumber
  );
  const fontSize = clamp(stored);

  const setFontSize = useCallback(
    (next: number) => saveFontSize(clamp(next)),
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
