# Travel Tracker

A web app for discovering places to visit and building a personal travel wishlist.
Search popular spots by keyword and location using the [Foursquare Places API](https://docs.foursquare.com/fsq-developers-places/),
inspect full details for any place, and save the ones you like — your wishlist is
kept in the browser so it survives reloads.

## Features

- **Discover page** — shows the top popular places on load and lets you search by
  keyword and location (city name or `lat,lng` coordinates).
- **Details modal** — opens rich per-place details (rating, description, photos,
  tips/reviews, website, phone, coordinates and a map link), loaded on demand.
- **Wishlist page** — lists saved places with a local text filter. Saved places are
  persisted to `localStorage`, so they survive a page reload.
- **Reusable components** — a place card and a place list are shared across both
  pages; a saved place shows a filled star.
- **Caching** — repeated API requests for the same city (and per-place detail calls)
  are cached for 10 minutes to avoid redundant network traffic.

## Tech stack

- **Angular 22** — standalone components, signals, `OnPush` change detection, and a
  zoneless setup (no `zone.js`).
- **Foursquare Places API** for place data.
- **SCSS** with shared design tokens (see `src/assets/styles/_variables.scss`).
- **Vitest** for unit tests and **Prettier** for formatting.

## Getting started

### Prerequisites

- Node.js `^20.19` / `^22.12` / `^24.15` (or newer), matching the Angular CLI 22
  requirement.
- npm (bundled with Node).

### Install

```bash
npm install
```

### Run the dev server

```bash
npm start
```

Then open `http://localhost:4200/`.

## Foursquare API configuration

Configuration lives in [`src/app/services/foursquare.config.ts`](src/app/services/foursquare.config.ts):

```ts
export const FOURSQUARE_CONFIG = {
  apiKey: '<your-service-key>',
  baseUrl: '/fsq/places',
  apiVersion: '2025-06-17',
  popularLimit: 9,
  searchLimit: 9,
  enablePremiumData: false,
};
```

- **`apiKey`** — a Foursquare **Service Key** from
  [foursquare.com/developers](https://foursquare.com/developers/). Leaving it empty
  makes the app return no results (it does not crash).
- **CORS / proxy** — the Foursquare API is server-to-server only (no CORS), so in
  development requests go through the Angular dev-server proxy defined in
  [`proxy.conf.json`](proxy.conf.json), which forwards `/fsq/*` to
  `https://places-api.foursquare.com/*`. For production, point `baseUrl` at your own
  backend proxy and keep the key server-side.
- **Premium data** — `rating`, `photos`, `tips` and place details are Premium fields
  that require account credits and return HTTP 429 on a free-tier key. They are only
  requested when `enablePremiumData` is `true`. Leave it `false` to stay on the free
  tier (search + core fields still work); set it `true` after adding credits so the
  details modal populates ratings, photos and tips.

## Project structure

```
src/app/
  components/
    header/          Navigation bar with saved-count badge
    place-card/      Reusable place tile
    place-list/      Reusable grid of place cards
    place-details/   Details modal
  pages/
    home/            Discover page (search + popular)
    wishlist/        Saved places + local filter
  models/            Place, PlaceDetail, Foursquare and cache types
  services/
    api.service.ts       Foursquare API calls + details-modal state
    cache.service.ts     In-memory TTL cache (10 min)
    wishlist.service.ts  Saved places, persisted to localStorage
    items.service.ts     Discover-page list state
    foursquare.config.ts API settings
```

## Available scripts

| Command         | Description                                   |
| --------------- | --------------------------------------------- |
| `npm start`     | Start the dev server with live reload         |
| `npm run build` | Production build into `dist/`                 |
| `npm test`      | Run unit tests with Vitest                    |
| `npm run watch` | Rebuild on change (development configuration) |

Formatting is handled by Prettier:

```bash
npx prettier --check "src/**/*.{ts,html,scss}"   # verify
npx prettier --write "src/**/*.{ts,html,scss}"   # fix
```
