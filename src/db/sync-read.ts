/**
 * Synchronous reads for data a screen needs on its first render.
 *
 * Drizzle's expo-sqlite driver is async-only, so anything routed through it
 * needs at least one extra frame before data exists, which is what the old
 * loading spinners were showing. The list and reader hooks use expo-sqlite's
 * `*Sync` API instead, so data exists during the first render.
 *
 * The trade-off is that they block the JS thread. `timedRead` logs any read
 * that exceeds a frame budget in development, so a read heavy enough to be felt
 * as a hang shows up instead of being guessed at.
 *
 * Writes and on-demand reads (bookmarks, search) still go through Drizzle.
 */

const FRAME_BUDGET_MS = 16;

export function timedRead<T>(label: string, read: () => T): T {
  if (!__DEV__) return read();
  const start = Date.now();
  const result = read();
  const ms = Date.now() - start;
  if (ms > FRAME_BUDGET_MS) console.log(`[sync-read] ${label} took ${ms}ms`);
  return result;
}
