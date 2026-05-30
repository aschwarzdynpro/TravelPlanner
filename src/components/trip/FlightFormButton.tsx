"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modal from "@/components/Modal";
import type { Flight } from "./types";
import { saveFlight } from "@/app/(app)/trips/[id]/actions";
import { CURRENCIES } from "@/lib/constants";
import SelectMenu from "@/components/ui/SelectMenu";
import { useFlightAutocomplete, useFlightStatus } from "@/hooks/useFlights";
import type {
  FlightSuggestion,
  FlightStatus,
  FlightStatusCode,
} from "@/lib/airlabs";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  TriangleAlert,
  Loader2,
} from "@/components/icons";

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));

// Format a timestamptz value for a datetime-local input (local time, no seconds).
function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const STATUS_LABELS: Record<FlightStatusCode, string> = {
  scheduled: "Geplant",
  active: "In der Luft",
  landed: "Gelandet",
  cancelled: "Annulliert",
  diverted: "Umgeleitet",
  unknown: "Unbekannt",
};

const STATUS_STYLES: Record<FlightStatusCode, string> = {
  scheduled: "bg-black/5 text-[var(--muted)] dark:bg-white/10",
  active: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  landed: "bg-green-500/15 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
  diverted: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  unknown: "bg-black/5 text-[var(--muted)] dark:bg-white/10",
};

// Show only the time portion of an AirLabs "YYYY-MM-DD HH:mm" value.
function timeOnly(value: string | null): string | null {
  if (!value) return null;
  const m = value.match(/(\d{2}:\d{2})/);
  return m ? m[1] : value;
}

export default function FlightFormButton({
  tripId,
  flight,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  flight?: Flight;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const f = flight;

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={f ? "Flug bearbeiten" : "Flug hinzufügen"}
      >
        {/* Remount per open so the controlled fields reset cleanly. */}
        {open && (
          <FlightForm
            key={f?.id ?? "new"}
            tripId={tripId}
            flight={f}
            onClose={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}

function FlightForm({
  tripId,
  flight: f,
  onClose,
}: {
  tripId: string;
  flight?: Flight;
  onClose: () => void;
}) {
  // Fields the flight lookup can fill are controlled; the rest stay
  // uncontrolled with defaultValue.
  const [airline, setAirline] = useState(f?.airline ?? "");
  const [flightNumber, setFlightNumber] = useState(f?.flight_number ?? "");
  const [depAirport, setDepAirport] = useState(f?.departure_airport ?? "");
  const [arrAirport, setArrAirport] = useState(f?.arrival_airport ?? "");
  const [depTime, setDepTime] = useState(
    toLocalInput(f?.departure_time ?? null),
  );

  // The chosen flight (compact IATA) drives the live-status lookup; only set on
  // an explicit suggestion pick so typing doesn't spam the status endpoint.
  const [chosenIata, setChosenIata] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading, configured } =
    useFlightAutocomplete(flightNumber);
  const statusDate = depTime ? depTime.slice(0, 10) : "";
  const {
    status,
    loading: statusLoading,
    configured: statusConfigured,
  } = useFlightStatus(chosenIata, statusDate);

  // Close the suggestions dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(s: FlightSuggestion) {
    setFlightNumber(s.flight_iata);
    if (s.airline_name) setAirline(s.airline_name);
    if (s.dep_iata) setDepAirport(s.dep_iata);
    if (s.arr_iata) setArrAirport(s.arr_iata);
    setChosenIata(s.flight_iata);
    setShowSuggestions(false);
  }

  return (
    <form
      action={async (formData) => {
        await saveFlight(formData);
        onClose();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="trip_id" value={tripId} />
      {f && <input type="hidden" name="id" value={f.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Fluggesellschaft</label>
          <input
            name="airline"
            className="input"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            placeholder="z. B. Lufthansa"
          />
        </div>
        <div ref={fieldRef} className="relative">
          <label className="label">Flugnummer</label>
          <div className="relative">
            <input
              name="flight_number"
              className="input pr-9"
              value={flightNumber}
              autoComplete="off"
              onChange={(e) => {
                setFlightNumber(e.target.value);
                setChosenIata("");
                setShowSuggestions(true);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="LH 1234"
            />
            {loading && (
              <Loader2
                className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--muted)]"
                strokeWidth={2}
              />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-[var(--surface)] shadow-lg">
              {suggestions.map((s) => (
                <li key={s.flight_iata}>
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <Plane
                      className="h-4 w-4 shrink-0 text-[var(--muted)]"
                      strokeWidth={2}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {s.flight_iata}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {[
                          s.airline_name,
                          [s.dep_iata, s.arr_iata].filter(Boolean).join(" → "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!configured && flightNumber.replace(/\s+/g, "").length >= 3 && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Flugsuche inaktiv (kein API-Schlüssel) – Eingabe von Hand möglich.
            </p>
          )}
        </div>
      </div>

      {/* Live status card */}
      {chosenIata && (statusLoading || status || !statusConfigured) && (
        <FlightStatusCard
          loading={statusLoading}
          status={status}
          configured={statusConfigured}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Abflughafen</label>
          <input
            name="departure_airport"
            className="input"
            value={depAirport}
            onChange={(e) => setDepAirport(e.target.value)}
            placeholder="FRA"
          />
        </div>
        <div>
          <label className="label">Zielflughafen</label>
          <input
            name="arrival_airport"
            className="input"
            value={arrAirport}
            onChange={(e) => setArrAirport(e.target.value)}
            placeholder="FLR"
          />
        </div>
        <div>
          <label className="label">Abflug</label>
          <input
            name="departure_time"
            type="datetime-local"
            className="input"
            value={depTime}
            onChange={(e) => setDepTime(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Ankunft</label>
          <input
            name="arrival_time"
            type="datetime-local"
            className="input"
            defaultValue={toLocalInput(f?.arrival_time ?? null)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">Kosten</label>
          <input
            name="cost"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={f?.cost ?? ""}
            placeholder="0,00"
          />
        </div>
        <div>
          <label className="label">Währung</label>
          <SelectMenu
            name="currency"
            defaultValue={f?.currency ?? "EUR"}
            options={CURRENCY_OPTIONS}
          />
        </div>
      </div>

      <div>
        <label className="label">Stornierungsbedingungen</label>
        <textarea
          name="cancellation_policy"
          className="textarea"
          rows={2}
          defaultValue={f?.cancellation_policy ?? ""}
          placeholder="z. B. nicht erstattbar / umbuchbar gegen Gebühr"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Buchungsnummer</label>
          <input
            name="booking_reference"
            className="input"
            defaultValue={f?.booking_reference ?? ""}
          />
        </div>
        <div>
          <label className="label">Buchungs-Link</label>
          <input
            name="booking_url"
            type="url"
            className="input"
            defaultValue={f?.booking_url ?? ""}
            placeholder="https://"
          />
        </div>
      </div>

      <div>
        <label className="label">Notizen</label>
        <textarea
          name="notes"
          className="textarea"
          rows={2}
          defaultValue={f?.notes ?? ""}
        />
      </div>

      <FormActions onCancel={onClose} />
    </form>
  );
}

// Submit + cancel row inside the <form> so useFormStatus reflects the pending
// server action: spinner + locked buttons while saving.
function FormActions({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={onCancel}
        disabled={pending}
      >
        Abbrechen
      </button>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Speichern…
          </>
        ) : (
          "Speichern"
        )}
      </button>
    </div>
  );
}

function FlightStatusCard({
  loading,
  status,
  configured,
}: {
  loading: boolean;
  status: FlightStatus | null;
  configured: boolean;
}) {
  if (!configured) {
    return (
      <div className="rounded-lg border bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
        Live-Status nicht verfügbar (kein API-Schlüssel konfiguriert).
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        Live-Status wird geladen…
      </div>
    );
  }
  if (!status) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
        <TriangleAlert className="h-4 w-4" strokeWidth={2} />
        Keine Live-Daten für diesen Flug gefunden.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Plane className="h-4 w-4" strokeWidth={2} />
          {[status.airline_name, status.flight_iata]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <span className={`chip ${STATUS_STYLES[status.status]}`}>
          {STATUS_LABELS[status.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <FlightEndpoint
          kind="dep"
          iata={status.dep_iata}
          terminal={status.dep_terminal}
          gate={status.dep_gate}
          scheduled={status.dep_time_scheduled}
          estimated={status.dep_time_estimated}
          delay={status.dep_delay}
        />
        <FlightEndpoint
          kind="arr"
          iata={status.arr_iata}
          terminal={status.arr_terminal}
          gate={status.arr_gate}
          scheduled={status.arr_time_scheduled}
          estimated={status.arr_time_estimated}
          delay={status.arr_delay}
        />
      </div>
    </div>
  );
}

function FlightEndpoint({
  kind,
  iata,
  terminal,
  gate,
  scheduled,
  estimated,
  delay,
}: {
  kind: "dep" | "arr";
  iata: string | null;
  terminal: string | null;
  gate: string | null;
  scheduled: string | null;
  estimated: string | null;
  delay: number | null;
}) {
  const Icon = kind === "dep" ? PlaneTakeoff : PlaneLanding;
  const sched = timeOnly(scheduled);
  const est = timeOnly(estimated);
  const delayed = typeof delay === "number" && delay > 0;

  return (
    <div>
      <div className="flex items-center gap-1.5 font-medium">
        <Icon className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={2} />
        {iata ?? "—"}
      </div>
      <div className="mt-1 space-y-0.5 text-xs text-[var(--muted)]">
        {(terminal || gate) && (
          <div>
            {terminal && `Terminal ${terminal}`}
            {terminal && gate && " · "}
            {gate && `Gate ${gate}`}
          </div>
        )}
        {sched && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" strokeWidth={2} />
            <span className={delayed ? "line-through" : ""}>{sched}</span>
            {est && est !== sched && (
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {est}
              </span>
            )}
            {delayed && (
              <span className="text-amber-600 dark:text-amber-400">
                +{delay} Min
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
