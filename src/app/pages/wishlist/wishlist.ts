import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { PlaceList } from '../../components/place-list/place-list';
import { WishlistService } from '../../services/wishlist.service';

/** Wishlist page: lists saved places with a local text filter. */
@Component({
  selector: 'app-wishlist',
  imports: [PlaceList],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Wishlist {
  private readonly wishlist = inject(WishlistService);

  /** Number of saved places. */
  readonly count = this.wishlist.count;
  /** Bound filter input. */
  readonly query = signal('');

  /** Saved places matching the current filter. */
  readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    const places = this.wishlist.places();
    if (!term) {
      return places;
    }
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term),
    );
  });
}
