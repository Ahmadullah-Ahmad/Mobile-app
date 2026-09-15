import { useCallback, useEffect } from "react";

import { QUERY_KEYS } from "@/lib/query-keys";
import { invalidateQuery } from "@/lib/query-store";
import { loadSetting, peekSetting, saveSetting } from "@/lib/settings";

import { useQueryVersion } from "./use-query-version";

const isPresent = <T,>(value: unknown): value is T => value != null;

// Shared across every mounted screen: saving a value re-renders all readers of that key.
export function usePersistedSetting<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T = isPresent
) {
  const queryKey = QUERY_KEYS.setting(key);
  useQueryVersion(queryKey);

  useEffect(() => {
    if (peekSetting(key) !== undefined) return;
    loadSetting(key).then(() => invalidateQuery(queryKey));
  }, [key, queryKey]);

  const cached = peekSetting<unknown>(key);
  const value = isValid(cached) ? cached : fallback;

  const setValue = useCallback(
    async (next: T) => {
      await saveSetting(key, next);
      invalidateQuery(queryKey);
    },
    [key, queryKey]
  );

  return [value, setValue] as const;
}
