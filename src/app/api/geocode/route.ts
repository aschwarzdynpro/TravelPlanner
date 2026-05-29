import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Geocoding proxy over OpenStreetMap Nominatim (free, no API key).
// Server-side so we can set a proper User-Agent and keep the upstream call off
// the client. Auth-gated: only signed-in users may query it.
//
// Nominatim usage policy: max 1 req/s, identify via User-Agent. We forward a
// descriptive UA and rely on interactive (per-keystroke, debounced) use.

export type GeocodeResult = {
  label: string;
  // Short place name (e.g. the hotel/POI name) when available.
  name: string;
  // Concise address line (street, city, country) for autofill.
  address: string;
  latitude: number;
  longitude: number;
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TravelPlanner/1.0 (trip planning app; geocoding)",
        "Accept-Language": "de,en",
      },
      // Cache identical lookups for a day to stay friendly to Nominatim.
      next: { revalidate: 86_400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Geocoding nicht verfügbar." },
        { status: 502 },
      );
    }

    type NominatimRow = {
      display_name: string;
      name?: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    };
    const raw = (await res.json()) as NominatimRow[];

    // Build a concise address line from the most useful parts.
    const addressLine = (a: Record<string, string> | undefined): string => {
      if (!a) return "";
      const street = [a.road, a.house_number].filter(Boolean).join(" ");
      const city = a.city || a.town || a.village || a.municipality || "";
      const parts = [street, [a.postcode, city].filter(Boolean).join(" "), a.country];
      return parts.filter(Boolean).join(", ");
    };

    const results: GeocodeResult[] = raw
      .map((r) => ({
        label: r.display_name,
        name: r.name || r.display_name.split(",")[0] || "",
        address: addressLine(r.address) || r.display_name,
        latitude: Number(r.lat),
        longitude: Number(r.lon),
      }))
      .filter(
        (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude),
      );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Geocoding fehlgeschlagen." },
      { status: 502 },
    );
  }
}
