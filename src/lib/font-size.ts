import { useCallback, useEffect, useState } from "react";
import { loadSetting, saveSetting } from "./settings";

export const MIN_FONT_SIZE = 14;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 18;
export const FONT_SIZE_STEP = 2;

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<number>(DEFAULT_FONT_SIZE);

  useEffect(() => {
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
