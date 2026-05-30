import { NextRequest, NextResponse } from "next/server";
import {
  airlabsFetch,
  hasAirlabsKey,
  AirlabsError,
  type AirlabsFlightRow,
  type FlightSuggestion,
} from "@/lib/airlabs";

// GET /api/flights/autocomplete?q=LH44
// Server-side proxy to AirLabs; the API key never reaches the browser.
// Cached ~1h since flight schedules change slowly.
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }
  if (!hasAirlabsKey()) {
    // Soft-fail: the field stays usable as a plain input without a key.
    return NextResponse.json({ suggestions: [], configured: false });
  }

  try {
    // Normalize "LH 44" -> "LH44" for the flight_iata-style lookup.
    const compact = query.replace(/\s+/g, "").toUpperCase();
    const data = await airlabsFetch<{ response?: AirlabsFlightRow[] }>(
      "schedules",
      { flight_iata: compact },
      3600,
    );

    const rows = Array.isArray(data.response) ? data.response : [];
    const seen = new Set<string>();
    const suggestions: FlightSuggestion[] = [];
    for (const r of rows) {
      const iata = r.flight_iata?.toUpperCase();
      if (!iata || seen.has(iata)) continue;
      seen.add(iata);
      const route = [r.dep_iata, r.arr_iata].filter(Boolean).join(" → ");
      suggestions.push({
        flight_iata: iata,
        flight_icao: r.flight_icao ?? null,
        airline_iata: r.airline_iata ?? null,
        airline_name: r.airline_name ?? null,
        dep_iata: r.dep_iata ?? null,
        arr_iata: r.arr_iata ?? null,
        label: route ? `${iata} · ${route}` : iata,
      });
      if (suggestions.length >= 8) break;
    }

    return NextResponse.json({ suggestions, configured: true });
  } catch (err) {
    const status = err instanceof AirlabsError ? err.status : 502;
    return NextResponse.json({ suggestions: [] }, { status });
  }
}
