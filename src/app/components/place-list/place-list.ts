import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Place } from '../../models/place.model';
import { PlaceCard } from '../place-card/place-card';

/** Renders a grid of place cards with loading and empty states. */
@Component({
  selector: 'app-place-list',
  imports: [PlaceCard],
  templateUrl: './place-list.html',
  styleUrl: './place-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceList {
  /** Places to render. */
  readonly places = input.required<Place[]>();
  /** Whether a request is in flight. */
  readonly loading = input(false);
  /** Message shown when there are no places. */
  readonly emptyMessage = input('No places to show yet.');
}
