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
