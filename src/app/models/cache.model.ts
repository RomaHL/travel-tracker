/** A single cached value together with the time it expires. */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
