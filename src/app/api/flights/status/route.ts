import { NextRequest, NextResponse } from "next/server";
import {
  airlabsFetch,
  hasAirlabsKey,
  AirlabsError,
  toFlightStatus,
  type AirlabsFlightRow,
} from "@/lib/airlabs";

// GET /api/flights/status?flight_iata=LH441&date=YYYY-MM-DD
// Live flight status proxy. Cached ~2 min so gate/delay stay fresh without
// burning the quota.
export const revalidate = 120;

const FLIGHT_IATA = /^[A-Z0-9]{2,3}\d{1,4}$/;

export async function GET(req: NextRequest) {
  const flightIata = req.nextUrl.searchParams
    .get("flight_iata")
    ?.replace(/\s+/g, "")
    .toUpperCase();
  const date = req.nextUrl.searchParams.get("date")?.trim();

  if (!flightIata || !FLIGHT_IATA.test(flightIata)) {
    return NextResponse.json({ status: null }, { status: 400 });
  }
  if (!hasAirlabsKey()) {
    return NextResponse.json({ status: null, configured: false });
  }

  try {
    // Flight numbers aren't unique without a date; pass it through when given.
    const params: Record<string, string> = { flight_iata: flightIata };
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) params.dep_date = date;

    const data = await airlabsFetch<{
      response?: AirlabsFlightRow | AirlabsFlightRow[];
    }>("flight", params, 120);

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
