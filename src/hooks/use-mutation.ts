import { useCallback, useState } from "react";

import { useDb, type DB } from "@/db/client";

/**
 * Wraps a Drizzle write so a screen gets `mutate` plus a pending flag.
 *
 * Module hooks build their add/delete hooks on this, the same way the web
 * modules build theirs on a shared CRUD factory.
 *
 * @param write A stable, module-level function taking the DB first.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  write: (db: DB, ...args: TArgs) => Promise<TResult>
) {
  const db = useDb();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsPending(true);
      try {
        return await write(db, ...args);
      } finally {
        setIsPending(false);
      }
    },
    [db, write]
  );

  return { mutate, isPending };
}
