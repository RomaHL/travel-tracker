import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Wishlist } from './pages/wishlist/wishlist';

export const routes: Routes = [
  { path: '', component: Home, title: 'Discover • Travel Tracker' },
  { path: 'wishlist', component: Wishlist, title: 'Wishlist • Travel Tracker' },
  { path: '**', redirectTo: '' },
];
