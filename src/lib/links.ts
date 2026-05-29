// Helpers for building key-free external deep links (maps, flight tracking).
// These open the user's browser/app of choice and need no API key or billing.

/** Google Maps search link from a free-text address or place name. */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Google Maps search link from latitude/longitude coordinates. */
export function mapsCoordsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Google Maps driving-directions link to an address or place name. */
export function mapsDirectionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    query,
  )}`;
}

/**
 * Best map link for a place: prefers coordinates, falls back to a text query.
 * Returns null when there is nothing to locate.
 */
export function placeMapUrl(opts: {
  latitude?: number | null;
  longitude?: number | null;
  query?: string | null;
}): string | null {
  const { latitude, longitude, query } = opts;
  if (latitude != null && longitude != null) {
    return mapsCoordsUrl(latitude, longitude);
  }
  const q = query?.trim();
  return q ? mapsSearchUrl(q) : null;
}

/**
 * Flight-tracking link from airline + flight number. Uses a Google search,
 * which surfaces the live flight-status card for a flight code.
 * Returns null when there is nothing to identify the flight.
 */
export function flightTrackUrl(
  airline: string | null | undefined,
  flightNumber: string | null | undefined,
): string | null {
  const code = [airline, flightNumber]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");
  if (!code) return null;
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${code} flight status`,
  )}`;
}
