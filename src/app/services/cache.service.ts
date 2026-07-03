import { Injectable } from '@angular/core';

import { CacheEntry } from '../models/cache.model';

/** In-memory key/value cache with a per-entry time to live. */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly defaultTtl = 10 * 60 * 1000;
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /** Return the cached value for a key, or null if missing or expired. */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /** Store a value under a key with an optional time to live in milliseconds. */
  set<T>(key: string, value: T, ttl: number = this.defaultTtl): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }
}
