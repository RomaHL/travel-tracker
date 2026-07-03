/** Settings for the Foursquare Places API. */
export const FOURSQUARE_CONFIG = {
  apiKey: '3GJRCSXYISGA4LN5AM00XH25ZSUVMGDULUBNORKICQ2ROMPU',
  baseUrl: '/fsq/places',
  apiVersion: '2025-06-17',
  popularLimit: 9,
  searchLimit: 9,
  // This used to fetch additional data like photos, tips and detail,
  // but the free tier of the API no longer supports it.
  enablePremiumData: false,
};

/** Whether an API key has been configured. */
export function hasApiKey(): boolean {
  return FOURSQUARE_CONFIG.apiKey.trim().length > 0;
}
