import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { usePersistedSetting } from "./use-persisted-setting";

type Updater<T> = T | ((prev: T) => T);

// For values that change on every tap or keystroke: state updates at once, the file write is debounced.
export function useDraftSetting<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
  delay = 600
) {
  const [stored, save] = usePersistedSetting(key, fallback, isValid);
  const [draft, setDraft] = useState<T | null>(null);
  const value = draft ?? stored;

  const latest = useRef(value);
  latest.current = value;
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!pending.current) return;
    pending.current = false;
    save(latest.current);
  }, [save]);

  const update = useCallback(
    (next: Updater<T>) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(latest.current) : next;
      latest.current = resolved;
      setDraft(resolved);
      pending.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") flush();
    });
    return () => {
      subscription.remove();
      flush();
    };
  }, [flush]);

  return [value, update] as const;
}
