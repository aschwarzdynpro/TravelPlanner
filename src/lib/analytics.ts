import { nightsBetween } from "@/lib/format";
import { countryName } from "@/lib/countries";
import type { Tables } from "@/lib/database.types";

type Accommodation = Tables<"accommodations">;
type Flight = Tables<"flights">;
type Area = Pick<Tables<"areas">, "id" | "country_code">;

// Sum a cost field, ignoring nulls.
function sum<T>(rows: T[], pick: (r: T) => number | null): number {
  return rows.reduce((s, r) => s + (pick(r) ?? 0), 0);
}

// Distinct currencies among priced items, to flag mixed-currency totals.
export function usedCurrencies(
  accommodations: Pick<Accommodation, "cost" | "currency">[],
  flights: Pick<Flight, "cost" | "currency">[],
): string[] {
  return Array.from(
    new Set(
      [...accommodations, ...flights]
        .filter((i) => i.cost != null)
        .map((i) => i.currency),
    ),
  );
}

export type TripMetrics = {
  accTotal: number;
  flightTotal: number;
  total: number;
  nights: number; // summed across accommodations
  avgPerNight: number; // accTotal / nights (0 if no nights)
  flightCount: number; // flights with a cost
  avgPerFlight: number; // flightTotal / flightCount
  currencies: string[];
  mixedCurrencies: boolean;
};

export function tripMetrics(
  accommodations: Pick<
    Accommodation,
    "cost" | "currency" | "check_in_date" | "check_out_date"
  >[],
  flights: Pick<Flight, "cost" | "currency">[],
): TripMetrics {
  const accTotal = sum(accommodations, (a) => a.cost);
  const flightTotal = sum(flights, (f) => f.cost);
  const nights = accommodations.reduce(
    (s, a) => s + (nightsBetween(a.check_in_date, a.check_out_date) ?? 0),
    0,
  );
  const pricedFlights = flights.filter((f) => f.cost != null);
  const currencies = usedCurrencies(accommodations, flights);
  return {
    accTotal,
    flightTotal,
    total: accTotal + flightTotal,
    nights,
    avgPerNight: nights > 0 ? accTotal / nights : 0,
    flightCount: pricedFlights.length,
    avgPerFlight: pricedFlights.length ? flightTotal / pricedFlights.length : 0,
    currencies,
    mixedCurrencies: currencies.length > 1,
  };
}

export type CountryCost = {
  code: string | null; // null = area without a country (or no area)
  name: string; // localized; "Ohne Land" for null
  cost: number;
  nights: number;
};

// Accommodation cost grouped by the area's country. Flights have no country,
// so they're intentionally excluded here.
export function costByCountry(
  accommodations: Pick<
    Accommodation,
    "cost" | "area_id" | "check_in_date" | "check_out_date"
  >[],
  areas: Area[],
  locale = "de",
): CountryCost[] {
  const countryOfArea = new Map<string, string | null>();
  for (const a of areas) countryOfArea.set(a.id, a.country_code ?? null);

  const buckets = new Map<string | null, { cost: number; nights: number }>();
  for (const acc of accommodations) {
    const code = acc.area_id ? (countryOfArea.get(acc.area_id) ?? null) : null;
    const b = buckets.get(code) ?? { cost: 0, nights: 0 };
    b.cost += acc.cost ?? 0;
    b.nights += nightsBetween(acc.check_in_date, acc.check_out_date) ?? 0;
    buckets.set(code, b);
  }

  return Array.from(buckets.entries())
    .map(([code, b]) => ({
      code,
      name: code ? countryName(code, locale) : "Ohne Land",
      cost: b.cost,
      nights: b.nights,
    }))
    .sort((a, b) => b.cost - a.cost);
}
