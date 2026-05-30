import { NextRequest, NextResponse } from "next/server";
import {
  airlabsFetch,
  hasAirlabsKey,
  AirlabsError,
  toFlightStatus,
  type AirlabsFlightRow,
} from "@/lib/airlabs";

// GET /api/flights/status?flight_iata=LH441
// Live flight status proxy. Cached ~2 min so gate/delay stay fresh without
// burning the quota.
//
// Note: the AirLabs free plan rejects the `dep_date` param ("restricted_access"),
// so we don't filter by date here — /flight returns the current/next leg for
// the number. A `date` query param is still accepted but ignored, so the client
// contract stays stable if you upgrade the plan later.
export const revalidate = 120;

const FLIGHT_IATA = /^[A-Z0-9]{2,3}\d{1,4}$/;

export async function GET(req: NextRequest) {
  const flightIata = req.nextUrl.searchParams
    .get("flight_iata")
    ?.replace(/\s+/g, "")
    .toUpperCase();

  if (!flightIata || !FLIGHT_IATA.test(flightIata)) {
    return NextResponse.json({ status: null }, { status: 400 });
  }
  if (!hasAirlabsKey()) {
    return NextResponse.json({ status: null, configured: false });
  }

  try {
    const data = await airlabsFetch<{
      response?: AirlabsFlightRow | AirlabsFlightRow[];
    }>("flight", { flight_iata: flightIata }, 120);

    // AirLabs /flight returns a single object; /schedules an array. Handle both.
    const row = Array.isArray(data.response)
      ? data.response[0]
      : data.response;
    if (!row) {
      return NextResponse.json({ status: null, configured: true });
    }

    return NextResponse.json({
      status: toFlightStatus(row),
      configured: true,
    });
  } catch (err) {
    const status = err instanceof AirlabsError ? err.status : 502;
    return NextResponse.json({ status: null }, { status });
  }
}
