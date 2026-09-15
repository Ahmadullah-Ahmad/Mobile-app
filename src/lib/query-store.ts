type Listener = () => void;

const versions = new Map<string, number>();
const listeners = new Map<string, Set<Listener>>();

export function getQueryVersion(key: string): number {
  return versions.get(key) ?? 0;
}

export function subscribeQuery(key: string, listener: Listener): () => void {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);
  return () => {
    keyListeners.delete(listener);
  };
}

export function invalidateQuery(key: string): void {
  versions.set(key, getQueryVersion(key) + 1);
  listeners.get(key)?.forEach((listener) => listener());
}
