import { useCallback, useState } from "react";

import { useDb, type DB } from "@/db/client";
import { invalidateQuery } from "@/lib/query-store";

export function useMutation<TArgs extends unknown[], TResult>(
  write: (db: DB, ...args: TArgs) => Promise<TResult>,
  invalidates: readonly string[] = []
) {
  const db = useDb();
  const [isPending, setIsPending] = useState(false);
  const invalidateKey = invalidates.join("|");

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsPending(true);
      try {
        const result = await write(db, ...args);
        invalidateKey.split("|").filter(Boolean).forEach(invalidateQuery);
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [db, write, invalidateKey]
  );

  return { mutate, isPending };
}
