import { useCallback, useEffect, useState } from "react";
import { loadSetting, peekSetting, saveSetting } from "./settings";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 18;
export const FONT_SIZE_STEP = 2;

export function useFontSize() {
  // Start from the cached value so the first render already uses the saved
  // size — otherwise every verse is laid out at the default and then again.
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const cached = peekSetting<number>("fontSize");
    return typeof cached === "number" ? cached : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    if (peekSetting("fontSize") !== undefined) return; // cache already applied
    loadSetting<number>("fontSize").then((saved) => {
      if (typeof saved === "number") setFontSizeState(saved);
    });
  }, []);

  const setFontSize = useCallback((next: number) => {
    const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, next));
    setFontSizeState(clamped);
    saveSetting("fontSize", clamped);
  }, []);

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
