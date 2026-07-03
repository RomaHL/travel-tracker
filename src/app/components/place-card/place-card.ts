import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { Place } from '../../models/place.model';
import { ApiService } from '../../services/api.service';
import { WishlistService } from '../../services/wishlist.service';

/** A single reusable place tile. */
@Component({
  selector: 'app-place-card',
  imports: [],
  templateUrl: './place-card.html',
  styleUrl: './place-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceCard {
  private readonly wishlist = inject(WishlistService);
  private readonly api = inject(ApiService);

  /** The place to render. */
  readonly place = input.required<Place>();

  /** Whether this place is in the wishlist. */
  readonly isSaved = computed(() => this.wishlist.has(this.place().id));
  /** The cover photo URL, or null when there is none. */
  readonly cover = computed(() => this.place().photos[0] ?? null);

  /** Add or remove this place from the wishlist. */
  toggleSaved(): void {
    this.wishlist.toggle(this.place());
  }

  /** Open the details modal for this place. */
  openDetails(): void {
    this.api.openDetails(this.place());
  }
}
