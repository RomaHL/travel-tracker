import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { PlaceList } from '../../components/place-list/place-list';
import { ItemsService } from '../../services/items.service';

/** Discover page: shows popular places and runs keyword/location searches. */
@Component({
  selector: 'app-home',
  imports: [PlaceList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly itemsService = inject(ItemsService);

  readonly items = this.itemsService.items;
  readonly loading = this.itemsService.loading;
  readonly error = this.itemsService.error;
  readonly activeKeyword = this.itemsService.keyword;

  /** Bound keyword search input. */
  readonly keyword = signal('');
  /** Bound location search input. */
  readonly location = signal('');

  /** Load popular places on first visit. */
  ngOnInit(): void {
    if (this.items().length === 0) {
      this.itemsService.loadPopular();
    }
  }

  /** Run a search with the current inputs. */
  onSearch(): void {
    this.itemsService.search(this.keyword(), this.location());
  }
}
