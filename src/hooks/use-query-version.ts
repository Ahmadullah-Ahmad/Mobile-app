import { useCallback, useSyncExternalStore } from "react";

import { getQueryVersion, subscribeQuery } from "@/lib/query-store";

export function useQueryVersion(key: string): number {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeQuery(key, onChange),
    [key]
  );
  const getSnapshot = useCallback(() => getQueryVersion(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
