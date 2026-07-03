/** A photo reference from Foursquare; the final URL is prefix + size + suffix. */
export interface FoursquarePhoto {
  prefix: string;
  suffix: string;
}

/** A user tip returned by Foursquare. */
export interface FoursquareTip {
  text: string;
}

/** The location block of a Foursquare place. */
export interface FoursquareLocation {
  formatted_address?: string;
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
}

/** A raw place object returned by the Foursquare Places API. */
export interface FoursquarePlace {
  fsq_place_id: string;
  name: string;
  categories?: { name: string; icon?: { prefix: string; suffix: string } }[];
  location?: FoursquareLocation;
  latitude?: number;
  longitude?: number;
  rating?: number;
  description?: string;
  website?: string;
  tel?: string;
  photos?: FoursquarePhoto[];
  tips?: FoursquareTip[];
}

/** The response shape of the Foursquare place-search endpoint. */
export interface FoursquareResponse {
  results: FoursquarePlace[];
}

/** A payload that may be a bare array or wrapped in `{ results: [...] }`. */
export type MaybeWrapped<T> = T[] | { results?: T[] };
