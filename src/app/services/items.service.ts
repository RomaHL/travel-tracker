import { Injectable, inject, signal } from '@angular/core';

import { Place } from '../models/place.model';
import { ApiService } from './api.service';

const DEFAULT_LOCATION = 'New York';

/** Holds the list state for the home page (results, loading and error flags). */
@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly api = inject(ApiService);

  private readonly _items = signal<Place[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _keyword = signal('');
  private readonly _location = signal(DEFAULT_LOCATION);

  /** The current list of places. */
  readonly items = this._items.asReadonly();
  /** Whether a request is in flight. */
  readonly loading = this._loading.asReadonly();
  /** The current error message, or null. */
  readonly error = this._error.asReadonly();
  /** The active search keyword, or empty for popular results. */
  readonly keyword = this._keyword.asReadonly();

  /** Load the popular places for a city. */
  loadPopular(location: string = DEFAULT_LOCATION): void {
    this._keyword.set('');
    this._location.set(location || DEFAULT_LOCATION);
    this.run(this.api.getPopularPlaces(this._location()));
  }

  /** Search places by keyword within a city, falling back to popular when empty. */
  search(keyword: string, location: string): void {
    const city = location.trim() || DEFAULT_LOCATION;
    this._keyword.set(keyword.trim());
    this._location.set(city);
    if (!keyword.trim()) {
      this.run(this.api.getPopularPlaces(city));
      return;
    }
    this.run(this.api.searchPlaces(keyword.trim(), city));
  }

  /** Subscribe to a request source and reflect its result in the state signals. */
  private run(source: ReturnType<ApiService['searchPlaces']>): void {
    this._loading.set(true);
    this._error.set(null);
    source.subscribe({
      next: (places) => {
        this._items.set(places);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Something went wrong while loading places.');
        this._loading.set(false);
      },
    });
  }
}
