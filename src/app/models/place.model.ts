/** A place shown in the app, mapped from the API or restored from the wishlist. */
export interface Place {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  address: string;
  rating: number | null;
  photos: string[];
  tips: string[];
  latitude: number | null;
  longitude: number | null;
}

/** Extra per-place details loaded lazily when the details modal opens. */
export interface PlaceDetail {
  rating: number | null;
  description: string | null;
  website: string | null;
  tel: string | null;
}
