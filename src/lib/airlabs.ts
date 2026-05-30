// Server-side AirLabs client. The API key lives only here (AIRLABS_API_KEY)
// and is never sent to the browser — all access goes through our API routes.
//
// Docs: https://airlabs.co/docs
const AIRLABS_BASE = "https://airlabs.co/api/v9";

export class AirlabsError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AirlabsError";
  }
}

export function hasAirlabsKey(): boolean {
  return Boolean(process.env.AIRLABS_API_KEY);
}

// Calls an AirLabs endpoint with the server-side key injected. `revalidate`
// (seconds) drives Next.js fetch caching so we stay within the free quota.
export async function airlabsFetch<T = unknown>(
  endpoint: string,
  params: Record<string, string>,
  revalidate: number,
): Promise<T> {
  const key = process.env.AIRLABS_API_KEY;
  if (!key) {
    throw new AirlabsError("AIRLABS_API_KEY is not configured", 500);
  }

  const url = new URL(`${AIRLABS_BASE}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  url.searchParams.set("api_key", key);

  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new AirlabsError(`AirLabs responded ${res.status}`, res.status);
  }

  const json = (await res.json()) as { error?: { message?: string } };
  // AirLabs returns HTTP 200 with an `error` object on failures.
  if (json && json.error) {
    throw new AirlabsError(json.error.message ?? "AirLabs error", 502);
  }
  return json as T;
}

// ---- Normalized shapes returned to the client ------------------------------

export interface FlightSuggestion {
  flight_iata: string; // e.g. "LH441"
  flight_icao: string | null;
  airline_iata: string | null;
  airline_name: string | null;
  dep_iata: string | null;
  arr_iata: string | null;
  label: string; // human-readable, e.g. "LH 441 · MUC → FRA"
}

export type FlightStatusCode =
  | "scheduled"
  | "active"
  | "landed"
  | "cancelled"
  | "diverted"
  | "unknown";

export interface FlightStatus {
  flight_iata: string | null;
  flight_number: string | null;
  airline_iata: string | null;
  airline_name: string | null;
  status: FlightStatusCode;
  dep_iata: string | null;
  dep_terminal: string | null;
  dep_gate: string | null;
  dep_time_scheduled: string | null; // "YYYY-MM-DD HH:mm" (local, per AirLabs)
  dep_time_estimated: string | null;
  dep_delay: number | null; // minutes
  arr_iata: string | null;
  arr_terminal: string | null;
  arr_gate: string | null;
  arr_time_scheduled: string | null;
  arr_time_estimated: string | null;
  arr_delay: number | null;
}

const STATUS_CODES: FlightStatusCode[] = [
  "scheduled",
  "active",
  "landed",
  "cancelled",
  "diverted",
];

export function normalizeStatusCode(value: unknown): FlightStatusCode {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return (STATUS_CODES as string[]).includes(v)
    ? (v as FlightStatusCode)
    : "unknown";
}

// AirLabs raw row (subset of fields we use). All optional/defensive.
export interface AirlabsFlightRow {
  flight_iata?: string;
  flight_icao?: string;
  flight_number?: string;
  airline_iata?: string;
  airline_name?: string;
  dep_iata?: string;
  dep_terminal?: string;
  dep_gate?: string;
  dep_time?: string;
  dep_estimated?: string;
  dep_delayed?: number;
  arr_iata?: string;
  arr_terminal?: string;
  arr_gate?: string;
  arr_time?: string;
  arr_estimated?: string;
  arr_delayed?: number;
  status?: string;
}

export function toFlightStatus(row: AirlabsFlightRow): FlightStatus {
  return {
    flight_iata: row.flight_iata ?? null,
    flight_number: row.flight_number ?? null,
    airline_iata: row.airline_iata ?? null,
    airline_name: row.airline_name ?? null,
    status: normalizeStatusCode(row.status),
    dep_iata: row.dep_iata ?? null,
    dep_terminal: row.dep_terminal ?? null,
    dep_gate: row.dep_gate ?? null,
    dep_time_scheduled: row.dep_time ?? null,
    dep_time_estimated: row.dep_estimated ?? null,
    dep_delay: typeof row.dep_delayed === "number" ? row.dep_delayed : null,
    arr_iata: row.arr_iata ?? null,
    arr_terminal: row.arr_terminal ?? null,
    arr_gate: row.arr_gate ?? null,
    arr_time_scheduled: row.arr_time ?? null,
    arr_time_estimated: row.arr_estimated ?? null,
    arr_delay: typeof row.arr_delayed === "number" ? row.arr_delayed : null,
  };
}
