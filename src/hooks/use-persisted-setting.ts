import { useCallback, useEffect, useState } from "react";

import { loadSetting, peekSetting, saveSetting } from "@/lib/settings";

const isPresent = <T,>(value: unknown): value is T => value != null;

/**
 * A value stored in the settings file, as `[value, setValue]`.
 *
 * The first render takes the saved value from the in-memory settings cache.
 * A value that arrives a render late would re-lay out every verse on screen.
 * The async load only runs when the cache has not been filled yet.
 *
 * @param isValid Rejects saved values of the wrong shape; defaults to "not null".
 */
export function usePersistedSetting<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T = isPresent
) {
  const [value, setValueState] = useState<T>(() => {
    const cached = peekSetting<unknown>(key);
    return isValid(cached) ? cached : fallback;
  });

  useEffect(() => {
    if (peekSetting(key) !== undefined) return; // cache already applied
    loadSetting<unknown>(key).then((saved) => {
      if (isValid(saved)) setValueState(saved);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      saveSetting(key, next);
    },
    [key]
  );

  return [value, setValue] as const;
}
