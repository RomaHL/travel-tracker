import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Place, PlaceDetail } from '../models/place.model';
import {
  FoursquareLocation,
  FoursquarePlace,
  FoursquarePhoto,
  FoursquareResponse,
  FoursquareTip,
  MaybeWrapped,
} from '../models/foursquare.model';
import { CacheService } from './cache.service';
import { FOURSQUARE_CONFIG, hasApiKey } from './foursquare.config';

/** Talks to the Foursquare Places API and holds the details-modal selection. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private readonly coreFields = 'fsq_place_id,name,categories,location,latitude,longitude';
  private readonly detailFields = 'rating,description,website,tel';

  private readonly _selectedPlace = signal<Place | null>(null);
  /** The place whose details modal is currently open, or null when closed. */
  readonly selectedPlace = this._selectedPlace.asReadonly();

  /** Open the details modal for the given place. */
  openDetails(place: Place): void {
    this._selectedPlace.set(place);
  }

  /** Close the details modal. */
  closeDetails(): void {
    this._selectedPlace.set(null);
  }

  /** Fetch the most popular places for a city. */
  getPopularPlaces(location: string): Observable<Place[]> {
    return this.query('', location, 'POPULARITY', FOURSQUARE_CONFIG.popularLimit);
  }

  /** Search places by keyword within a city. */
  searchPlaces(keyword: string, location: string): Observable<Place[]> {
    return this.query(keyword, location, 'RELEVANCE', FOURSQUARE_CONFIG.searchLimit);
  }

  /** Fetch extra scalar details (rating, description, website, phone) for a place. */
  getPlaceDetails(id: string): Observable<PlaceDetail> {
    const cacheKey = `detail|${id}`;
    const cached = this.cache.get<PlaceDetail>(cacheKey);
    if (cached) {
      return of(cached);
    }
    if (!this.premiumEnabled()) {
      return of(this.emptyDetail());
    }
    const params = new HttpParams().set('fields', this.detailFields);
    return this.http
      .get<FoursquarePlace>(`${FOURSQUARE_CONFIG.baseUrl}/${id}`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(
        map((raw) => ({
          rating: raw.rating ?? null,
          description: raw.description ?? null,
          website: raw.website ?? null,
          tel: raw.tel ?? null,
        })),
        tap((detail) => this.cache.set(cacheKey, detail)),
        catchError(() => of(this.emptyDetail())),
      );
  }

  /** Fetch user tips and reviews for a place. */
  getPlaceTips(id: string): Observable<string[]> {
    const cacheKey = `tips|${id}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return of(cached);
    }
    if (!this.premiumEnabled()) {
      return of([]);
    }
    return this.http
      .get<MaybeWrapped<FoursquareTip>>(`${FOURSQUARE_CONFIG.baseUrl}/${id}/tips`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((res) =>
          this.asArray(res)
            .map((t) => t.text)
            .filter((t) => !!t),
        ),
        tap((tips) => this.cache.set(cacheKey, tips)),
        catchError(() => of([])),
      );
  }

  /** Fetch photo URLs for a place. */
  getPlacePhotos(id: string): Observable<string[]> {
    const cacheKey = `photos|${id}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) {
      return of(cached);
    }
    if (!this.premiumEnabled()) {
      return of([]);
    }
    return this.http
      .get<MaybeWrapped<FoursquarePhoto>>(`${FOURSQUARE_CONFIG.baseUrl}/${id}/photos`, {
        headers: this.authHeaders(),
      })
      .pipe(
        map((res) =>
          this.asArray(res).map((p) => this.buildImageUrl(p.prefix, p.suffix, '600x400')),
        ),
        tap((photos) => this.cache.set(cacheKey, photos)),
        catchError(() => of([])),
      );
  }

  /** Run a cached place-search request and map the results to `Place`. */
  private query(
    keyword: string,
    location: string,
    sort: string,
    limit: number,
  ): Observable<Place[]> {
    const cacheKey = this.buildCacheKey(keyword, location, sort, limit);
    const cached = this.cache.get<Place[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    if (!hasApiKey()) {
      return of([]);
    }

    let params = new HttpParams()
      .set('limit', String(limit))
      .set('sort', sort)
      .set('fields', this.coreFields);
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(location.trim())) {
      params = params.set('ll', location.trim());
    } else {
      params = params.set('near', location || 'New York');
    }
    if (keyword.trim()) {
      params = params.set('query', keyword.trim());
    }

    return this.http
      .get<FoursquareResponse>(`${FOURSQUARE_CONFIG.baseUrl}/search`, {
        headers: this.authHeaders(),
        params,
      })
      .pipe(
        map((response) => (response.results ?? []).map((r) => this.toPlace(r))),
        tap((places) => this.cache.set(cacheKey, places)),
      );
  }

  /** Whether the Premium detail endpoints may be called (key present and enabled). */
  private premiumEnabled(): boolean {
    return hasApiKey() && FOURSQUARE_CONFIG.enablePremiumData;
  }

  /** Build the auth and version headers required by the API. */
  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${FOURSQUARE_CONFIG.apiKey}`,
      'X-Places-Api-Version': FOURSQUARE_CONFIG.apiVersion,
      Accept: 'application/json',
    });
  }

  /** Build a stable cache key for a search request. */
  private buildCacheKey(keyword: string, location: string, sort: string, limit: number): string {
    return [
      keyword.trim().toLowerCase(),
      (location || 'new york').trim().toLowerCase(),
      sort,
      limit,
    ].join('|');
  }

  /** Map a raw Foursquare place to the app's `Place` shape. */
  private toPlace(raw: FoursquarePlace): Place {
    const category = raw.categories?.[0];
    return {
      id: raw.fsq_place_id,
      name: raw.name,
      category: category?.name ?? 'Place',
      categoryIcon: category?.icon
        ? this.buildImageUrl(category.icon.prefix, category.icon.suffix, '64')
        : '',
      address: this.formatAddress(raw.location),
      rating: raw.rating ?? null,
      photos: (raw.photos ?? []).map((p) => this.buildImageUrl(p.prefix, p.suffix, '600x400')),
      tips: (raw.tips ?? []).map((t) => t.text),
      latitude: raw.latitude ?? null,
      longitude: raw.longitude ?? null,
    };
  }

  /** Build a Foursquare image URL from its prefix, size and suffix. */
  private buildImageUrl(prefix: string, suffix: string, size: string): string {
    return `${prefix}${size}${suffix}`;
  }

  /** Normalise a payload that may be a bare array or `{ results: [...] }`. */
  private asArray<T>(res: MaybeWrapped<T>): T[] {
    return Array.isArray(res) ? res : (res.results ?? []);
  }

  /** An empty `PlaceDetail` used when no data is available. */
  private emptyDetail(): PlaceDetail {
    return { rating: null, description: null, website: null, tel: null };
  }

  /** Build a display address, falling back to composed parts when needed. */
  private formatAddress(location?: FoursquareLocation): string {
    if (!location) {
      return 'Address unavailable';
    }
    if (location.formatted_address) {
      return location.formatted_address;
    }
    const parts = [location.address, location.locality, location.region, location.country];
    const joined = parts.filter((p) => !!p).join(', ');
    return joined || 'Address unavailable';
  }
}
