/**
 * Tiny in-memory TTL cache for recommendations.
 *
 * The home screen is fetched often and LLM calls are slow + rate-limited, so
 * recommendations are cached per user. This is a single-process cache, which is
 * fine for the current single-instance server (server.ts). When the app scales
 * horizontally, swap this module for Redis — the interface intentionally stays
 * tiny to make that easy.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();
const MAX_ENTRIES = 5000;

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key) as Entry<T> | undefined;
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  if (store.size >= MAX_ENTRIES) {
    // Cheap eviction: drop the oldest inserted key.
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

/** Invalidate every cached entry whose key starts with the prefix (e.g. "rec:user:1"). */
export function cacheDeleteByPrefix(prefix: string): void {
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) store.delete(key);
  });
}
