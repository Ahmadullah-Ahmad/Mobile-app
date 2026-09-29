import { useCallback } from "react";

import { usePersistedSetting } from "./use-persisted-setting";

export const MAX_HIJRI_ADJUST = 2;

const isAdjust = (value: unknown): value is number =>
  typeof value === "number" && Math.abs(value) <= MAX_HIJRI_ADJUST;

// Moon sighting in Afghanistan can differ from Umm al-Qura by a day or two.
export function useHijriAdjust() {
  const [adjust, setAdjust] = usePersistedSetting("hijriAdjust", 0, isAdjust);

  const change = useCallback(
    (delta: number) => {
      const next = Math.max(-MAX_HIJRI_ADJUST, Math.min(MAX_HIJRI_ADJUST, adjust + delta));
      if (next !== adjust) setAdjust(next);
    },
    [adjust, setAdjust]
  );

  return { adjust, increase: () => change(1), decrease: () => change(-1) };
}
