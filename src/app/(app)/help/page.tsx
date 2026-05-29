import Link from "next/link";

export const metadata = { title: "Hilfe – TravelPlanner" };

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--foreground)]">
        {children}
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hilfe & Anleitung</h1>
        <p className="text-sm text-[var(--muted)]">
          So funktioniert TravelPlanner – von der ersten Reise bis zum Teilen mit
          anderen.
        </p>
      </div>

      <Section icon="🚀" title="Schnellstart">
        <ol className="ml-4 list-decimal space-y-1">
          <li>
            Gehe zu <strong>Reisen → Meine Reisen</strong> und klicke auf{" "}
            <strong>„+ Neue Reise / Event“</strong>.
          </li>
          <li>
            Gib Name, Typ (Reise oder Event), Ziel und Zeitraum ein und speichere.
          </li>
          <li>
            Öffne die Reise und fülle die Tabs <em>Unterkünfte</em>,{" "}
            <em>Flüge</em> und <em>Mitreisende</em>.
          </li>
          <li>
            Lade über den Tab <em>Mitglieder</em> andere zur gemeinsamen Planung
            ein.
          </li>
        </ol>
      </Section>

      <Section icon="🧭" title="Navigation">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Dashboard</strong> – Überblick über deine Reisen und schnelle
            Einstiegspunkte.
          </li>
          <li>
            <strong>Reisen → Meine Reisen</strong> – Reisen, die dir gehören (du
            bist Eigentümer).
          </li>
          <li>
            <strong>Reisen → Geteilte Reisen</strong> – Reisen, zu denen du
            eingeladen wurdest.
          </li>
          <li>
            <strong>Reisen → Follow-Up Reisen</strong> – Reisen, denen du folgst
            (in Vorbereitung).
          </li>
          <li>
            <strong>Account</strong> – dein Profil (Allgemeine Informationen) und
            deine Sicherheitseinstellungen.
          </li>
        </ul>
        <p className="text-[var(--muted)]">
          Oben im Header siehst du links dein Profil und daneben deinen aktuellen
          Standort in der App (z. B. <em>Reisen › Kroatien 2026</em>).
        </p>
      </Section>

      <Section icon="🗺️" title="Gegenden & Unterkünfte">
        <p>
          Innerhalb einer Reise gliederst du Unterkünfte nach{" "}
          <strong>Gegenden</strong> (z. B. Regionen oder Städte). Lege zuerst eine
          Gegend an und ordne dann Unterkünfte zu.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Jede Unterkunft kann Check-in/-out, Verpflegung, Storno-Frist, Kosten
            und einen Buchungslink enthalten.
          </li>
          <li>
            Über den <strong>Karte</strong>-Link bzw. <strong>Route</strong> öffnest
            du den Ort direkt in Google Maps.
          </li>
        </ul>
      </Section>

      <Section icon="📍" title="Karte & Koordinaten">
        <p>
          Im Tab <strong>Karte</strong> siehst du alle Gegenden und Unterkünfte mit
          hinterlegten Koordinaten als Pins auf einer interaktiven Karte
          (OpenStreetMap).
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Beim Bearbeiten einer Gegend oder Unterkunft kannst du Koordinaten
            eintragen – oder per <strong>„📍 Koordinaten suchen“</strong>{" "}
            automatisch aus Name/Adresse ermitteln lassen.
          </li>
          <li>
            Einträge ohne Koordinaten erscheinen noch nicht auf der Karte; der Tab
            zeigt dir, wie viele das sind.
          </li>
        </ul>
      </Section>

      <Section icon="✈️" title="Flüge">
        <p>
          Trage Airline, Flugnummer, Flughäfen und Zeiten ein. Über{" "}
          <strong>„Flug verfolgen“</strong> springst du zum Live-Status des Flugs.
          Tipp: Gib die Flugnummer als Code an (z. B. <code>LH1234</code>).
        </p>
      </Section>

      <Section icon="💶" title="Budget & Kosten">
        <p>
          In der <strong>Übersicht</strong> jeder Reise siehst du die
          Gesamtkosten, aufgeteilt nach Unterkünften und Flügen, sowie die Kosten
          pro Person (sobald Mitreisende hinterlegt sind).
        </p>
      </Section>

      <Section icon="🤝" title="Mitglieder & Rollen">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Eigentümer</strong> – volle Kontrolle inklusive Löschen.
          </li>
          <li>
            <strong>Bearbeiter</strong> – darf Inhalte hinzufügen und ändern.
          </li>
          <li>
            <strong>Betrachter</strong> – darf nur lesen.
          </li>
        </ul>
        <p>
          Eingeladene Personen ohne Konto können sich registrieren – die Einladung
          wird beim Login automatisch zugeordnet.
        </p>
      </Section>

      <Section icon="📡" title="Follow-Me & Re-Travel">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Follow-Me:</strong> Aktiviere in einer Reise den öffentlichen,
            schreibgeschützten Link – andere können die Planung live mitverfolgen,
            ganz ohne Konto.
          </li>
          <li>
            <strong>Re-Travel:</strong> Dupliziere eine bestehende Reise als Vorlage
            für eine neue – inklusive Gegenden, Unterkünften und Mitreisenden.
          </li>
        </ul>
      </Section>

      <Section icon="🔐" title="Account & Sicherheit">
        <p>
          Unter <strong>Account → Allgemeine Informationen</strong> änderst du
          deinen Anzeigenamen. Unter <strong>Account → Sicherheit</strong> setzt du
          ein neues Passwort.
        </p>
      </Section>

      <div className="card bg-black/[0.02] p-5 text-sm dark:bg-white/[0.02]">
        Noch Fragen? Starte einfach mit{" "}
        <Link href="/trips" className="text-[var(--primary)] hover:underline">
          deiner ersten Reise
        </Link>{" "}
        – die meisten Funktionen erklären sich beim Ausprobieren.
      </div>
    </div>
  );
}
