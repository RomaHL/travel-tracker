import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { forkJoin } from 'rxjs';

import { PlaceDetail } from '../../models/place.model';
import { ApiService } from '../../services/api.service';
import { WishlistService } from '../../services/wishlist.service';

/** Modal that shows full details for the selected place, loaded on open. */
@Component({
  selector: 'app-place-details',
  imports: [],
  templateUrl: './place-details.html',
  styleUrl: './place-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceDetails {
  private readonly wishlist = inject(WishlistService);
  private readonly api = inject(ApiService);

  readonly place = this.api.selectedPlace;

  private readonly detail = signal<PlaceDetail | null>(null);
  private readonly fetchedTips = signal<string[]>([]);
  private readonly fetchedPhotos = signal<string[]>([]);
  readonly loading = signal(false);

  readonly rating = computed(() => this.detail()?.rating ?? this.place()?.rating ?? null);
  readonly description = computed(() => this.detail()?.description ?? null);
  readonly website = computed(() => this.detail()?.website ?? null);
  readonly tel = computed(() => this.detail()?.tel ?? null);

  readonly photos = computed(() => {
    const fetched = this.fetchedPhotos();
    return fetched.length ? fetched : (this.place()?.photos ?? []);
  });
  readonly tips = computed(() => {
    const fetched = this.fetchedTips();
    return fetched.length ? fetched : (this.place()?.tips ?? []);
  });

  readonly isSaved = computed(() => {
    const current = this.place();
    return current ? this.wishlist.has(current.id) : false;
  });

  readonly coordinates = computed(() => {
    const current = this.place();
    if (!current || current.latitude === null || current.longitude === null) {
      return null;
    }
    return `${current.latitude.toFixed(5)}, ${current.longitude.toFixed(5)}`;
  });

  readonly mapUrl = computed(() => {
    const current = this.place();
    if (!current || current.latitude === null || current.longitude === null) {
      return null;
    }
    return `https://www.google.com/maps/search/?api=1&query=${current.latitude},${current.longitude}`;
  });

  constructor() {
    effect(() => {
      const current = this.place();
      document.body.style.overflow = current ? 'hidden' : '';
      if (current) {
        this.loadDetails(current.id);
      } else {
        this.reset();
      }
    });
  }

  /** Load details, tips and photos for a place in parallel. */
  private loadDetails(id: string): void {
    this.reset();
    this.loading.set(true);
    forkJoin({
      detail: this.api.getPlaceDetails(id),
      tips: this.api.getPlaceTips(id),
      photos: this.api.getPlacePhotos(id),
    }).subscribe((result) => {
      if (this.place()?.id !== id) {
        return;
      }
      this.detail.set(result.detail);
      this.fetchedTips.set(result.tips);
      this.fetchedPhotos.set(result.photos);
      this.loading.set(false);
    });
  }

  /** Clear the loaded detail state. */
  private reset(): void {
    this.detail.set(null);
    this.fetchedTips.set([]);
    this.fetchedPhotos.set([]);
    this.loading.set(false);
  }

  /** Close the modal. */
  close(): void {
    this.api.closeDetails();
  }

  /** Add or remove the current place from the wishlist. */
  toggleSaved(): void {
    const current = this.place();
    if (current) {
      this.wishlist.toggle(current);
    }
  }

  /** Close the modal when the Escape key is pressed. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
