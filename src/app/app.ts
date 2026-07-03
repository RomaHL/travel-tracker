import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { PlaceDetails } from './components/place-details/place-details';

/** Root component: header, routed pages and the shared details modal. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, PlaceDetails],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
