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
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "0");

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

    const raw = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;

    const results: GeocodeResult[] = raw
      .map((r) => ({
        label: r.display_name,
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
