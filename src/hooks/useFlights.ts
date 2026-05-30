"use client";

import { useEffect, useRef, useState } from "react";
import type { FlightSuggestion, FlightStatus } from "@/lib/airlabs";

// Debounced flight-number autocomplete against our server proxy (which holds
// the AirLabs key). Returns suggestions for the current query.
export function useFlightAutocomplete(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<FlightSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.replace(/\s+/g, "").length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/flights/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setConfigured(data.configured !== false);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, debounceMs]);

  return { suggestions, loading, configured };
}

// Fetches live status for a chosen flight (iata + date). Pass an empty
// flightIata to reset/skip the lookup.
export function useFlightStatus(flightIata: string, date: string) {
  const [status, setStatus] = useState<FlightStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const iata = flightIata.replace(/\s+/g, "");
    if (!iata) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(null);
      return;
    }

    const controller = new AbortController();
    // setLoading lives inside the async callback (not the effect body) to keep
    // the render cycle clean, mirroring the geocode autocomplete.
    const run = async () => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ flight_iata: iata });
        if (date) params.set("date", date);
        const res = await fetch(`/api/flights/status?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setStatus(data.status ?? null);
        setConfigured(data.configured !== false);
        setError(!res.ok);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStatus(null);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    run();

    return () => controller.abort();
  }, [flightIata, date]);

  return { status, loading, error, configured };
}
