# ✈️ TravelPlanner

Eine kollaborative Web-App, um **Reisen und Events gemeinsam** zu planen –
mobil und am Laptop nutzbar.

## Features

- **Reisen & Events** anlegen, bearbeiten, löschen (mit Zeitraum, Ziel, Farbe)
- **Flüge** mit Route, Zeiten, Kosten und Stornierungsbedingungen
- **Unterkünfte** mit
  - Check-in / Check-out (Datum **und** Uhrzeit)
  - **Verpflegungsstufen** (Selbstverpflegung, Frühstück, Halb-/Vollpension, All Inclusive)
  - **Stornierungsbedingungen** je Unterkunft inkl. „kostenlos stornierbar bis" mit Frist-Countdown
  - Kosten, Buchungsnummer und Buchungs-Link
- **Gegenden / Orte** – eine Gegend kann **mehrere Unterkünfte** enthalten
- **Kosten** – automatische Aufschlüsselung (Unterkünfte vs. Flüge), Summe und Kosten/Person
- **Mitreisende** verwalten (auch Personen ohne App-Konto)
- **Member-Bereich** mit Collaboration:
  - Mitglieder per E-Mail **einladen** (Rollen: Eigentümer / Bearbeiter / Betrachter)
  - Einladungen werden bei Registrierung automatisch zugeordnet
  - **Follow Me** – öffentlicher, schreibgeschützter Link zum Mitverfolgen ohne Konto
  - **Re-Travel** – eine Reise als Vorlage klonen und für einen neuen Termin neu planen
- **Responsives Design** (Smartphone bis Desktop), Light- & Dark-Mode

## Tech-Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** – PostgreSQL, Auth (E-Mail/Passwort) und Row Level Security

## Setup

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Umgebungsvariablen anlegen – `.env.example` nach `.env.local` kopieren und
   mit den Werten deines Supabase-Projekts füllen:
   ```bash
   cp .env.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
   ```
3. Datenbank-Schema einspielen (falls neues Projekt) – die Migrationen liegen in
   `supabase/migrations/` und werden in der Reihenfolge `0001 → 0003` ausgeführt
   (Supabase SQL Editor oder `supabase db push`).
4. Entwicklung starten:
   ```bash
   npm run dev
   ```
   App unter http://localhost:3000

## Skripte

- `npm run dev` – Entwicklungsserver
- `npm run build` – Produktions-Build
- `npm start` – Produktionsserver
- `npm run lint` – ESLint

## Datenmodell (Kurzüberblick)

| Tabelle          | Zweck                                               |
| ---------------- | --------------------------------------------------- |
| `profiles`       | App-Nutzer (1:1 zu `auth.users`)                    |
| `trips`          | Reise oder Event                                    |
| `trip_members`   | Mitgliedschaft / Rollen / Einladungen               |
| `travelers`      | Mitreisende (auch ohne Konto)                       |
| `areas`          | Gegend/Ort (enthält mehrere Unterkünfte)            |
| `accommodations` | Unterkünfte inkl. Verpflegung, Storno, Check-in/out |
| `flights`        | Flüge inkl. Storno                                  |
| `trip_activity`  | Aktivitäts-Feed (Collaboration-Grundlage)           |

Der Zugriff ist vollständig über **Row Level Security** abgesichert: Nutzer
sehen nur Reisen, bei denen sie Mitglied sind (oder öffentliche „Follow Me"-Reisen).
Schreibrechte haben nur Eigentümer und Bearbeiter.

## Hinweis zur E-Mail-Bestätigung

Das Supabase-Projekt verlangt standardmäßig eine E-Mail-Bestätigung bei der
Registrierung. Für den Produktivbetrieb empfiehlt sich ein eigener SMTP-Anbieter
(Supabase Dashboard → Authentication → Emails), da der eingebaute Mailer stark
ratenbegrenzt ist. Alternativ lässt sich die Bestätigung unter
Authentication → Providers → Email deaktivieren, damit sich Nutzer sofort
anmelden können.
