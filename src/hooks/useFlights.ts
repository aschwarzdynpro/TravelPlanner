"use client";

import { useEffect, useRef, useState } from "react";
import type { FlightSuggestion, FlightStatus } from "@/lib/airlabs";

interface AutocompleteState {
  suggestions: FlightSuggestion[];
  loading: boolean;
  configured: boolean;
}

// Debounced flight-number autocomplete against our server proxy (which holds
// the AirLabs key). Returns suggestions for the current query.
export function useFlightAutocomplete(
  query: string,
  debounceMs = 300,
): AutocompleteState {
  const [state, setState] = useState<AutocompleteState>({
    suggestions: [],
    loading: false,
    configured: true,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.replace(/\s+/g, "");
    if (q.length < 3) {
      setState((s) => ({ ...s, suggestions: [], loading: false }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const controller = new AbortController();
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/flights/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setState({
          suggestions: data.suggestions ?? [],
          loading: false,
          configured: data.configured !== false,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({ suggestions: [], loading: false, configured: true });
      }
    }, debounceMs);

    return () => {
      controller.abort();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, debounceMs]);

  return state;
}

interface StatusState {
  status: FlightStatus | null;
  loading: boolean;
  error: boolean;
  configured: boolean;
}

// Fetches live status for a chosen flight (iata + date). Pass empty flightIata
// to reset/skip.
export function useFlightStatus(flightIata: string, date: string): StatusState {
  const [state, setState] = useState<StatusState>({
    status: null,
    loading: false,
    error: false,
    configured: true,
  });

  useEffect(() => {
    const iata = flightIata.replace(/\s+/g, "");
    if (!iata) {
      setState({ status: null, loading: false, error: false, configured: true });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: false }));
    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams({ flight_iata: iata });
        if (date) params.set("date", date);
        const res = await fetch(`/api/flights/status?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setState({
          status: data.status ?? null,
          loading: false,
          error: !res.ok,
          configured: data.configured !== false,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({
          status: null,
          loading: false,
          error: true,
          configured: true,
        });
      }
    })();

    return () => controller.abort();
  }, [flightIata, date]);

  return state;
}
