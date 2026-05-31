// Curated list of major airlines for the flight form's airline picker.
// Stored value is the airline NAME (the flights.airline column is free text),
// but we keep the IATA code to prefill the flight-number prefix. The picker is
// searchable and also allows free text for anything not listed.

export type Airline = { iata: string; name: string };

export const AIRLINES: Airline[] = [
  { iata: "LH", name: "Lufthansa" },
  { iata: "LX", name: "Swiss" },
  { iata: "OS", name: "Austrian Airlines" },
  { iata: "EW", name: "Eurowings" },
  { iata: "EN", name: "Air Dolomiti" },
  { iata: "AF", name: "Air France" },
  { iata: "KL", name: "KLM" },
  { iata: "BA", name: "British Airways" },
  { iata: "IB", name: "Iberia" },
  { iata: "VY", name: "Vueling" },
  { iata: "AZ", name: "ITA Airways" },
  { iata: "SN", name: "Brussels Airlines" },
  { iata: "TP", name: "TAP Air Portugal" },
  { iata: "SK", name: "SAS" },
  { iata: "AY", name: "Finnair" },
  { iata: "LO", name: "LOT Polish Airlines" },
  { iata: "OK", name: "Czech Airlines" },
  { iata: "A3", name: "Aegean Airlines" },
  { iata: "FR", name: "Ryanair" },
  { iata: "U2", name: "easyJet" },
  { iata: "W6", name: "Wizz Air" },
  { iata: "DE", name: "Condor" },
  { iata: "X3", name: "TUI fly" },
  { iata: "PC", name: "Pegasus Airlines" },
  { iata: "TK", name: "Turkish Airlines" },
  { iata: "EK", name: "Emirates" },
  { iata: "EY", name: "Etihad Airways" },
  { iata: "QR", name: "Qatar Airways" },
  { iata: "SV", name: "Saudia" },
  { iata: "MS", name: "EgyptAir" },
  { iata: "ET", name: "Ethiopian Airlines" },
  { iata: "SA", name: "South African Airways" },
  { iata: "AT", name: "Royal Air Maroc" },
  { iata: "UA", name: "United Airlines" },
  { iata: "AA", name: "American Airlines" },
  { iata: "DL", name: "Delta Air Lines" },
  { iata: "B6", name: "JetBlue" },
  { iata: "WN", name: "Southwest Airlines" },
  { iata: "AC", name: "Air Canada" },
  { iata: "AM", name: "Aeroméxico" },
  { iata: "LA", name: "LATAM Airlines" },
  { iata: "AV", name: "Avianca" },
  { iata: "JL", name: "Japan Airlines" },
  { iata: "NH", name: "ANA" },
  { iata: "KE", name: "Korean Air" },
  { iata: "OZ", name: "Asiana Airlines" },
  { iata: "CA", name: "Air China" },
  { iata: "CZ", name: "China Southern" },
  { iata: "MU", name: "China Eastern" },
  { iata: "CX", name: "Cathay Pacific" },
  { iata: "BR", name: "EVA Air" },
  { iata: "CI", name: "China Airlines" },
  { iata: "SQ", name: "Singapore Airlines" },
  { iata: "TG", name: "Thai Airways" },
  { iata: "MH", name: "Malaysia Airlines" },
  { iata: "GA", name: "Garuda Indonesia" },
  { iata: "VN", name: "Vietnam Airlines" },
  { iata: "AI", name: "Air India" },
  { iata: "QF", name: "Qantas" },
  { iata: "NZ", name: "Air New Zealand" },
].sort((a, b) => a.name.localeCompare(b.name, "de"));

// Look up an airline by its (case-insensitive) name.
export function airlineByName(name: string | null | undefined): Airline | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  return AIRLINES.find((a) => a.name.toLowerCase() === n) ?? null;
}
