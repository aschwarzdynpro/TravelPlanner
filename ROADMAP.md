# Roadmap / ToDo

Laufende Liste größerer Vorhaben. Kleinere Verbesserungen laufen direkt über PRs.

---

## 🚧 Vollwertige Mobile App für den App Store (iOS) / Play Store (Android)

**Status:** Analyse (noch nicht begonnen)
**Ziel:** TravelPlanner als installierbare, store-gelistete App.

### Ausgangslage (was schon da ist)
- **PWA-Grundlage vorhanden:** `src/app/manifest.ts` (installierbar, `display: standalone`),
  Service Worker (`public/sw.js`, offline-Shell, cached bewusst **kein** Auth/Supabase-Traffic),
  Icons (192/512/maskable), `offline.html`, Apple-Icon.
- **Stack:** Next.js 16 (App Router, Server Actions), Supabase (Auth/DB/RLS).
- **Auth:** Supabase E-Mail/Passwort **+ Google OAuth** (`signInWithOAuth`).

### Optionen (mit ehrlicher Einschätzung)

**Option A — Capacitor-Wrapper um die bestehende Web-App** ⭐ empfohlen
- Eine native Shell (iOS/Android) lädt die Next.js-App; UI-Code bleibt unverändert.
- Wenig Doppelarbeit, schnellster Weg in den Store, ein Code­stand.
- **Risiken:** Apple-Review 4.2 („minimum functionality") lehnt reine WebView-Wrapper teils ab →
  wir müssen *nativen Mehrwert* zeigen (Push, Share-Target, Offline, Haptics, Kamera für Belege …).
  OAuth muss über das native In-App-Browser-Flow laufen (nicht im reinen WebView).

**Option B — React Native / Expo (eigene native App)**
- Beste native Performance/UX, aber **kompletter UI-Rewrite** (großer Aufwand, zweiter Code­stand).
- Nur sinnvoll, wenn die App langfristig stark nativ werden soll.

**Option C — PWA bleiben (kein Store)**
- iOS: nur „Zum Homescreen". **Apple hat keinen App-Store-Weg für PWAs.**
- Android: über TWA in den Play Store möglich, iOS nicht. → erfüllt den Wunsch nicht.

→ **Vorschlag: Option A (Capacitor)**, nativen Mehrwert gezielt ergänzen.

### Was konkret zu tun ist (Option A)

**1. Store-/Apple-Pflichten (Blocker, früh klären)**
- [ ] **Sign in with Apple** ergänzen. Apple verlangt es, sobald ein anderer sozialer Login
      (Google) angeboten wird (Guideline 4.8). → Supabase Apple-Provider einrichten.
- [ ] Apple Developer Account (99 $/Jahr) + Google Play Developer (25 $ einmalig).
- [ ] Datenschutzerklärung + **Privacy Nutrition Labels** (welche Daten, wofür).
      Wir speichern PII (Namen, Geburtsdaten, Reisedaten) → sauber deklarieren.
- [ ] Konto-Löschung **in-app** (Apple-Pflicht, wenn Konto-Erstellung existiert).
- [ ] „Minimum functionality" entkräften: nativer Mehrwert (siehe Punkt 4).

**2. Capacitor-Setup**
- [ ] Capacitor in ein eigenes Verzeichnis/Repo-Teil integrieren (iOS + Android Projekt).
- [ ] Entscheiden: App lädt die **gehostete** URL (einfach, immer aktuell) **oder** ein
      statisch exportierter Build (offline-fähiger, aber Server Actions brauchen den Server →
      vermutlich gehostete URL + Server, da wir Server Actions/RLS nutzen).
- [ ] Deep-Linking / Universal Links konfigurieren (für OAuth-Rücksprung + geteilte Links).

**3. Auth im nativen Kontext**
- [ ] Google-OAuth auf das **native System-Browser-Flow** umstellen (ASWebAuthenticationSession /
      Custom Tabs) statt In-WebView — sonst blockiert Google den Login.
- [ ] Redirect-URLs / Supabase Auth-Redirects um die App-Schemes erweisen.
- [ ] Session-Persistenz im nativen Storage prüfen.

**4. Nativer Mehrwert (auch für Apple-Review wichtig)**
- [ ] **Push Notifications** (Reise-Erinnerungen, Zahlungs-/Stornofristen) — APNs/FCM.
      Braucht serverseitiges Auslösen + Geräte-Token-Tabelle.
- [ ] **Share Target / Teilen** nativ (Follow-Me-Links, „zu TravelPlanner hinzufügen").
- [ ] Optional: Kamera für Beleg-/Buchungs-Scan, Kalender-Integration nativ, Haptics.

**5. Build & Veröffentlichung**
- [ ] App-Icons/Splash in allen nötigen Größen, Store-Screenshots, Texte (DE/EN).
- [ ] iOS-Build über Xcode/Fastlane, Android-Build (signiert), TestFlight + interner Track.
- [ ] CI für die Mobile-Builds (optional).

### Offene Entscheidungen (für dich)
- Welche Plattform(en) zuerst — iOS, Android oder beide?
- Capacitor (empfohlen) oder doch nativer Rewrite?
- Sind wir bereit, **Sign in with Apple** + In-app-Kontolöschung zu bauen (beides Apple-Pflicht)?
- Wollen wir Push-Notifications (größerer eigener Baustein) gleich mitnehmen?

### Realistische Einordnung
- Capacitor-Wrapper „technisch lauffähig": überschaubar.
- Aber **store-tauglich** (Apple-Pflichten + nativer Mehrwert) ist der eigentliche Aufwand —
  v. a. Sign in with Apple, Push, Privacy/Review. Das ist ein **eigenes Projekt**, kein Quick-Win.
- Empfehlung: als nächsten großen Block separat angehen, in obiger Reihenfolge (Pflichten → Setup → Auth → Mehrwert → Release).

---

# Feature-Roadmap (Mai 2026)

Priorisierte Liste der nächsten Produkt-Features. Grundlage: Inventar des aktuellen
Codestands + Marktrecherche (Wettbewerber, Nutzererwartungen 2025/26, Monetarisierungs-Benchmarks).
Quellen am Ende des Dokuments.

**Leitgedanke / strategischer Fokus:** TravelPlanner soll **nicht** ein weiterer „KI plant deine
Reise"-Klon werden (kommodisiert, vertrauensfragil). Unsere verteidigbare Nische ist die
**Finanz- & Logistik-Schicht**, die weder die hübschen Kollaborations-Apps (Wanderlog) noch die
KI-Apps (Layla, MindTrip) sauber abbilden: **Zahlungsfristen, Anzahlungen/Raten, bezahlt/offen,
Stornofristen, Buchungslinks** — plus kollaborative Planung mit fein abgestuften Freigaben
(Follow-Me) und nummerierte Karten-Pins. Kurz: *„Der Planer, der weiß, wann Geld fällig ist und
bis wann du noch stornieren kannst."*

## Bewertungslegende
- **Impact:** erwarteter Nutzer-/Geschäftswert (★ niedrig … ★★★ hoch)
- **Aufwand:** grobe Größenordnung (S = Tage, M = 1–2 Wochen, L = mehrere Wochen, XL = eigenes Projekt)
- **Status heute:** was im Code schon existiert (aus dem Inventar)

---

## 🅐 Quick Wins / Lückenschluss (klein, hoher Hebel)

### A1 — Auswertungen: Bezahlt vs. Offen + Fälligkeiten
- **Impact:** ★★★ · **Aufwand:** S
- **Status heute:** `accommodations`/`flights` haben `is_paid` + `payment_due_date`; die `/insights`-Seite
  ignoriert diese Felder bislang. Auf Reise-Ebene gibt es die Aufteilung schon (`OverviewSection`).
- **To-Do:** In `/insights` (global) „bereits bezahlt / noch offen" und eine Liste **anstehender
  Zahlungen** über alle Reisen ergänzen. Reine Aggregation vorhandener Daten — kein Schema-Change.
- **Warum:** Direkt auf unsere Kern-Nische einzahlend; minimaler Aufwand, da Daten existieren.

### A2 — Rückflug auch beim Bearbeiten hinzufügen
- **Impact:** ★ · **Aufwand:** S
- **Status heute:** „Rückflug hinzufügen" gibt es nur beim **Neu-Anlegen** (`FlightFormButton`).
- **To-Do:** Option auch im Edit-Modus / als Button an der Flug-Karte.

### A3 — Mehrere Admin-Schalter / Feature-Flags ausbauen
- **Impact:** ★★ · **Aufwand:** S (je Flag)
- **Status heute:** `app_settings` + `/account/admin` existieren mit **einem** Flag (`show_print_pdf`).
- **To-Do:** Weitere globale Schalter nach Bedarf (z. B. einzelne Features sichtbar/unsichtbar
  schalten, Wartungshinweis). Trivial dank vorhandener Infrastruktur.

---

## 🅑 Kollaboration & Viralität (Wachstumstreiber, free)

### B1 — Gruppen-Abstimmungen / Polls ⭐ Top-Empfehlung
- **Impact:** ★★★ · **Aufwand:** M
- **Status heute:** Wir haben Mitglieder, Mitreisende, Unterkünfte/Gegenden als „Kandidaten" und
  ein kollaboratives Modell (RLS, Activity-Feed, Realtime). Aber **keine** Abstimmungsfunktion.
- **To-Do:** Pro Reise Polls anlegen („Welches Hotel?", „Welche Gegend?", „Welcher Termin?"),
  Mitglieder stimmen ab, Ergebnis sichtbar. Neue Tabellen `polls` + `poll_votes` (RLS analog).
- **Warum (Marktbeleg):** Gruppen-Voting ist **der** Trend 2026 (WePlanify, SquadTrip, TripVote,
  MonkeyTravel werben damit; „Konsens in 48 h statt Wochen"). Gruppenreisen-Nachfrage auf Rekordhoch.
  Bewusst **kostenlos** halten → treibt Einladungen/Viralität (Wanderlogs größtes Lob ist die freie
  Gruppen-Kollaboration; sie zu gaten würde die Wachstumsschleife killen).

### B2 — Einladungs-Verwaltung verbessern
- **Impact:** ★★ · **Aufwand:** S–M
- **Status heute:** Einladung per E-Mail + Rollen (`inviteMember`, `claim_invites` beim Login).
  Keine UI zum **Zurückziehen** offener Einladungen / Re-Send.
- **To-Do:** Pending-Invites anzeigen, widerrufen, erneut senden.

---

## 🅒 Die Finanz-Nische ausbauen (unser Alleinstellungsmerkmal)

### C1 — Kosten-Splitting „Wer schuldet wem" ⭐ strategisch
- **Impact:** ★★★ · **Aufwand:** M–L
- **Status heute:** Kosten + bezahlt/offen je Unterkunft/Flug vorhanden; **kein** Pro-Person-Split,
  kein „Zahler"-Feld, keine Salden.
- **To-Do:** Ausgabe = Betrag + **Zahler** + **Beteiligte** (+ Split-Modus: gleich / nach Erwachsen-Kind
  / einzelne ausschließen). „Settle-up"-Übersicht (Netto-Salden je Person). Nutzt vorhandene
  Mitreisende **inkl. Alter** für Split-Modi, die Splitwise nicht hat.
- **Warum (Marktbeleg):** Splitwise ist Referenz, gibt aber selbst zu, bei **Anzahlungen/Raten und
  großen Gruppen** zu versagen — genau dort, wo wir mit **Fälligkeiten** stark sind. „Wer schuldet
  wem für die Anzahlung, fällig 15. Juni" wäre **wirklich neu**. Cost-Splitting wird in 2026er
  „beste Gruppen-App"-Tests als Top-Kriterium gelistet. → **Pro-Feature**-Kandidat.

### C2 — Mehrwährung mit echter Umrechnung
- **Impact:** ★★ · **Aufwand:** M
- **Status heute:** `analytics.ts` **warnt** nur bei gemischten Währungen (amber Hinweis), summiert
  aber ungerechnet. Bewusste, ehrliche Einschränkung — aber eine Lücke.
- **To-Do:** Tageskurs-Quelle (z. B. EZB/Frankfurter API, keyless) + Umrechnung in eine Zielwährung;
  Originalbeträge erhalten. Kurse cachen.
- **Warum:** Internationale Reisen mischen Währungen ständig; ohne Umrechnung sind Gesamtsummen
  irreführend. Passt zur Finanz-Nische.

---

## 🅓 Automatisierung (höchster „Wow", aber Sorgfalt nötig)

### D1 — Buchungs-E-Mail-Import (Weiterleiten → Flug/Unterkunft anlegen) ⭐ größter Automations-Hebel
- **Impact:** ★★★ · **Aufwand:** L
- **Status heute:** Manuelle Eingabe; Flug-/Unterkunfts-Entitäten passen perfekt als Importziel.
  AirLabs liefert bereits Flugstatus zu einer Flugnummer.
- **To-Do:** Pro Reise/Nutzer eine **Weiterleitungs-Adresse** (z. B. `reise-<token>@inbound.domain`)
  → Inbound-Webhook (Mailgun/Postmark/SendGrid Inbound) → Parser: **schema.org JSON-LD**
  (`FlightReservation`/`LodgingReservation`) zuerst, **LLM-Extraktion** als Fallback → Zeile
  **zur Bestätigung** vorbefüllen (nie blind speichern). Booking.com-Mails als erster Zielfall
  (wir haben schon ein Booking-Link-Feld).
- **Warum (Marktbeleg):** TripIts (`plans@tripit.com`) und Tripsys (`my@tripsy.app`) Kern-Feature und
  meistgelobte Automatisierung; Wanderlogs Fehlen davon ist Top-Kritikpunkt. „Bestätigen statt
  blind übernehmen" umgeht das Vertrauensproblem von KI-Fehlparsen. Optional fertige API
  (AwardWallet) statt tausender Provider-Parser.
- **Abhängigkeit:** Inbound-Mail-Dienst (Kosten), ggf. LLM-Key.

### D2 — Deterministische „KI-fühlt-sich-an"-Assistenz
- **Impact:** ★★ · **Aufwand:** S–M (pro Baustein)
- **Status heute:** 3 KI-Flags (`ai.*`) sind **Stubs** (`available:false`, „kommt bald").
- **To-Do (statt generischer Reisegenerierung):**
  - **Zahlungs-/Storno-Radar:** „3 Zahlungen über 1.240 € in den nächsten 14 Tagen fällig;
    2 Stornofristen diese Woche." Reine Berechnung über vorhandene Felder — **kein Halluzinationsrisiko**.
  - **„Aktivitäten nahe Hotel #3"** an die bestehenden nummerierten Pins/Gegenden gekoppelt.
- **Warum (Marktbeleg):** Voll-KI-Itinerare sind kommodisiert **und** vertrauensfragil (Layla:
  falsche Flughäfen, Datums-Bugs = häufigste KI-Beschwerde). Deterministische Features auf unseren
  strukturierten Daten liefern den „smart"-Eindruck ohne das Risiko.

### D3 — Hotel-Kategorie & Bewertung live (bestehendes Pro-Stub aktivieren)
- **Impact:** ★★ · **Aufwand:** M · **Blocker:** Google-Places-Key + Billing
- **Status heute:** `hotel.ratings`-Flag + UI-Stub vorhanden (gated, „kommt bald").
- **To-Do:** Bei Bereitstellung eines Google-Places-Keys: Kategorie/Sterne + Gesamtbewertung live
  anzeigen (ToS-konform, **keine** Review-Texte speichern/umschreiben), serverseitig per
  `assertCan("hotel.ratings")` durchsetzen, `available:true` schalten.

---

## 🅔 Monetarisierung (das Geschäftsmodell scharf schalten)

### E1 — Stripe-Checkout + Trial-basiertes Pro ⭐ Voraussetzung für Umsatz
- **Impact:** ★★★ · **Aufwand:** L
- **Status heute:** `entitlements`-System sauber vorhanden (Flags, `assertCan`, manipulationssicherer
  `plan`), aber **kein Checkout** — `plan` wird nur „out-of-band" gesetzt. Kein Bezahlweg.
- **To-Do:** Stripe Checkout + Webhook → setzt `plan='pro'` (über Service-Role, der bestehende
  Tamper-Guard bleibt). **Zeitlich begrenzter Trial** statt reinem Freemium. Paywall **im Moment
  der Buchung/Zahlungserfassung** einblenden (höchste Dringlichkeit).
- **Warum (Marktbeleg/Benchmarks):** Reine Freemium-Conversion ~2–3 %; **Reise-Apps mit Trial
  konvertieren ~49 % (Median!)** — riesiger Hebel, weil Leute *im Buchungsmoment* abschließen.
  Höhere Preise konvertieren eher besser (Intent-Filter). Modaler Preis **9,99 $/Monat**;
  Jahres-Anker **39–49 $** (Kategorie-Norm: Wanderlog ~40, TripIt 49).

### E2 — Pro-Feature-Zuschnitt definieren
- **Impact:** ★★★ · **Aufwand:** S (Konzept) + abhängig von Features
- **To-Do / Empfehlung (was hinter die Paywall gehört):** Offline-Zugriff (E? siehe F1),
  **PDF/Print-Export** (Drucken existiert schon, aktuell admin-gated), **Kosten-Analytics-Dashboard**
  (pro Land, bezahlt/offen), Kosten-**Splitting** (C1), unbegrenzte Reisen/Mitreisende
  (`maxTrips`-Limit existiert, ist aber `null`/unbenutzt), **erweiterte Follow-Me-Freigaben**,
  **E-Mail-Import** (D1).
- **Was frei bleiben muss:** Kern-**Kollaboration** (gemeinsames Planen, Polls) — sonst verlieren
  wir die Gruppen-Viralität (Wanderlogs Erfolgsrezept).

---

## 🅕 Plattform / Infrastruktur

### F1 — Offline-Zugriff (PWA) als Pro-Feature
- **Impact:** ★★ · **Aufwand:** L
- **Status heute:** Service Worker = nur Offline-**Shell** (cached bewusst **kein** Auth/Supabase);
  keine Daten offline.
- **To-Do:** Reisedaten (Itinerary, Unterkünfte, Flüge, Kosten, Mitreisende) per **IndexedDB**
  offline lesbar cachen (sicher, pro Nutzer), ideal mit Sync. Karten-**Tiles** sind im PWA schwer →
  pragmatisch statische Pin-Snapshots je Gegend cachen + Deep-Link zu Offline-Map-Apps
  (Google/Apple/Organic Maps).
- **Warum (Marktbeleg):** Offline gilt als **essenziell** für die Reisephase; **Wanderlog UND
  TripIt** sperren es hinter ihre Paywall → erwartet **und** bewährter Monetarisierungshebel.

### F2 — Mobile App (Store) — *siehe eigener Abschnitt oben*
- Capacitor-Wrapper; Apple-Pflichten (Sign in with Apple, Push, Privacy). XL, eigenes Projekt.

### F3 — Sign in with Apple
- **Impact:** ★★ · **Aufwand:** M · **Pflicht** sobald App-Store (Apple Guideline 4.8, da Google-Login existiert)
- **Status heute:** Nur Google-OAuth (`handleOAuth` typisiert nur `"google"`).
- **To-Do:** Supabase Apple-Provider + UI; früh einplanen wegen Store-Abhängigkeit.

### F4 — Push-Notifications
- **Impact:** ★★ · **Aufwand:** L
- **Status heute:** `sw.js` hat **keine** push/notificationclick-Handler.
- **To-Do:** Web-Push (und später nativ via APNs/FCM): Reise-Erinnerungen, **Zahlungs-/Stornofristen**
  (zahlt direkt auf die Finanz-Nische ein), Aktivitäts-Benachrichtigungen. Token-Tabelle + Server-Trigger.

---

## 🅖 Nachhaltigkeit / Trend

### G1 — CO2-Schätzung pro Flug + Bahn-vs-Flug-Vergleich
- **Impact:** ★★ · **Aufwand:** S–M
- **Status heute:** Flug-Entität (Airline, Strecke, Status) vorhanden; keine Emissionsangabe.
- **To-Do:** Deterministische CO2-Berechnung je Flug (Distanz aus Flughäfen) + optional
  Bahn-Vergleich. Als „Carbon pro Land"-Sicht ins Analytics-Dashboard neben die Kosten-pro-Land.
- **Warum (Marktbeleg):** Nachhaltigkeit „nicht mehr optional" 2026; Transport ≈ 75 % des
  Fußabdrucks → Modus-Vergleiche höchster Hebel (z. B. London–Paris: Eurostar ~4 kg vs Flug ~90 kg).
  **Deterministisch** = kein KI-Risiko, passt zur datengetriebenen DNA.

---

## Empfohlene Reihenfolge (Synthese)

1. **A1** (Bezahlt/Offen in Insights) + **A2/A3** — sofortige Quick Wins, Daten liegen vor.
2. **B1 Gruppen-Polls** — billiger, viraler Wachstumstreiber, stärkster aktueller Trend, free.
3. **C1 Kosten-Splitting** — schärft die einzigartige Finanz-Nische; Pro-Kandidat.
4. **E1 Stripe + Trial** — Voraussetzung für Umsatz; ohne Bezahlweg bleibt Pro theoretisch.
   (Parallel **E2** Feature-Zuschnitt festzurren.)
5. **D1 E-Mail-Import** — größter Automations-„Wow", schließt die TripIt-Lücke.
6. **F1 Offline** + **G1 CO2** + **D2 deterministische Assistenz** — differenzierend, mittelfristig.
7. **F2–F4 Mobile/Apple/Push** — eigenes größeres Plattform-Projekt.

**Bewusst NICHT priorisiert:** generische „KI plant die ganze Reise"-Funktion — kommodisiert,
vertrauensfragil, hohe Fehlerquote als #1-Nutzerbeschwerde im Markt. Unser Vorteil sind
strukturierte Daten + Finanz-/Logistik-Fokus, nicht ein weiterer Chatbot.

---

## Quellen (Marktrecherche, Mai 2026)

Wettbewerber/Pricing: monkeyeatingmango.com (Wanderlog), tripit.com/web/pro/pricing,
wandrly.app (Roadtrippers/Tripsy), travefy.com/plans/pricing, skift.com (Google Travel-Aus),
techcrunch.com + trustpilot.com (Layla/Roam Around), 9to5mac.com (Tripsy).
Kosten-Splitting: splitwise.com, squadtrip.com (Splitwise-Alternativen), avantstay.com.
KI-Trends: stippl.io, monkeytravel.app, travelbta.com (Best-AI-Planner 2026).
E-Mail-Parsing: github.com/JohannesBuchner/flight-reservation-emails, awardwallet.com/email-parsing-api,
schema.org/Reservation + /FlightReservation, developers.google.com/gmail/markup.
Offline-Maps: simology.io, organicmaps.app, droidlore.com.
Monetarisierungs-Benchmarks: adapty.io (Trial-Conversion), airbridge.io (Pricing by Category 2026).
Trends (Gruppe/Voting/Nachhaltigkeit): weplanify.com, tripvote.app, americanexpress.com (Travel Trends),
theharrispoll.com, pixidia.com (Carbon 2026), blog.google (2026 Travel Trends).

*Hinweis: Exakte Preise (v. a. Wanderlog 40/49,99/59,99 $, Layla) schwanken je Quelle/Region/Promo —
vor Verwendung in Pitches auf den Hersteller-Seiten verifizieren. Feature- und Trend-Aussagen sind
über mehrere unabhängige Quellen konsistent.*
