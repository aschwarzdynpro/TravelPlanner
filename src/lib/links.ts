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
 * Keyless embeddable map URL (for use as an <iframe src>). Prefers
 * coordinates, falls back to a text query. Uses Google Maps' classic
 * `output=embed` endpoint, which needs no API key. Returns null when there is
 * nothing to locate.
 */
export function mapEmbedUrl(opts: {
  latitude?: number | null;
  longitude?: number | null;
  query?: string | null;
}): string | null {
  const { latitude, longitude, query } = opts;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=12&output=embed`;
  }
  const q = query?.trim();
  return q
    ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
    : null;
}

/**
 * Booking.com search deep link, prefilled from accommodation data. Keyless —
 * just opens a search. Dates are YYYY-MM-DD; children are passed as repeated
 * `age` params (Booking uses these for child pricing). Returns null when there
 * is nothing to search for.
 */
export function bookingSearchUrl(opts: {
  query?: string | null; // destination text (name and/or address)
  checkIn?: string | null;
  checkOut?: string | null;
  adults?: number | null;
  childAges?: number[]; // ages of children (<18)
}): string | null {
  const q = opts.query?.trim();
  if (!q) return null;
  const params = new URLSearchParams();
  params.set("ss", q);
  if (opts.checkIn) params.set("checkin", opts.checkIn);
  if (opts.checkOut) params.set("checkout", opts.checkOut);
  params.set("group_adults", String(Math.max(1, opts.adults ?? 2)));
  const ages = (opts.childAges ?? []).filter((a) => a >= 0 && a < 18);
  params.set("group_children", String(ages.length));
  // Booking expects one `age` entry per child.
  for (const a of ages) params.append("age", String(a));
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/**
 * Flight-tracking link on Flightradar24 from a flight number, e.g. "LH1234".
 * The number is normalised to the spaceless code Flightradar24 expects.
 * Returns null when there is no flight number to track.
 */
export function flightTrackUrl(
  flightNumber: string | null | undefined,
): string | null {
  const code = (flightNumber ?? "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (!code) return null;
  return `https://www.flightradar24.com/${code}`;
}
