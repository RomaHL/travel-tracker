import { Injectable, computed, effect, signal } from '@angular/core';

import { Place } from '../models/place.model';

const STORAGE_KEY = 'travel-tracker-wishlist';

/** Manages the user's saved places, persisted to localStorage. */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly items = signal<Place[]>(this.load());

  /** The saved places. */
  readonly places = this.items.asReadonly();
  /** How many places are saved. */
  readonly count = computed(() => this.items().length);

  private readonly idSet = computed(() => new Set(this.items().map((p) => p.id)));

  constructor() {
    effect(() => this.persist(this.items()));
  }

  /** Whether a place with this id is saved. */
  has(id: string): boolean {
    return this.idSet().has(id);
  }

  /** Add a place to the wishlist if not already saved. */
  add(place: Place): void {
    if (this.has(place.id)) {
      return;
    }
    this.items.update((list) => [...list, place]);
  }

  /** Remove a place from the wishlist by id. */
  remove(id: string): void {
    this.items.update((list) => list.filter((p) => p.id !== id));
  }

  /** Add the place if missing, otherwise remove it. */
  toggle(place: Place): void {
    if (this.has(place.id)) {
      this.remove(place.id);
    } else {
      this.add(place);
    }
  }

  /** Load the saved places from localStorage. */
  private load(): Place[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Place[]) : [];
    } catch {
      return [];
    }
  }

  /** Write the saved places to localStorage. */
  private persist(list: Place[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
}
