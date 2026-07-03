import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { WishlistService } from '../../services/wishlist.service';

/** App header with navigation and the saved-places count. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly wishlist = inject(WishlistService);

  /** Number of places saved in the wishlist. */
  readonly wishlistCount = this.wishlist.count;
}
