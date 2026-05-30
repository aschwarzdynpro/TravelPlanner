// Minimal, dependency-free iCalendar (RFC 5545) builder for trip export.
// Covers what we need: VEVENTs with UTC datetimes or all-day dates, proper
// text escaping, CRLF line endings and 75-octet line folding.

export type CalEvent = {
  uid: string;
  // Either timed (ISO instants -> UTC) or all-day (YYYY-MM-DD date strings).
  start: string;
  end?: string;
  allDay: boolean;
  summary: string;
  description?: string;
  location?: string;
};

// Escape TEXT values per RFC 5545 (backslash, comma, semicolon, newlines).
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Fold lines to <=75 octets with CRLF + leading space continuation.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function toUtcStamp(iso: string): string {
  const d = new Date(iso);
  // YYYYMMDDTHHMMSSZ
  return (
    d.getUTCFullYear().toString().padStart(4, "0") +
    (d.getUTCMonth() + 1).toString().padStart(2, "0") +
    d.getUTCDate().toString().padStart(2, "0") +
    "T" +
    d.getUTCHours().toString().padStart(2, "0") +
    d.getUTCMinutes().toString().padStart(2, "0") +
    d.getUTCSeconds().toString().padStart(2, "0") +
    "Z"
  );
}

function toDateValue(dateStr: string): string {
  // Accepts YYYY-MM-DD (date column) -> YYYYMMDD
  return dateStr.slice(0, 10).replace(/-/g, "");
}

// All-day DTEND is exclusive in iCal; add one day so a single date shows as one day.
function addOneDay(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return toDateValue(d.toISOString());
}

export function buildICalendar(
  events: CalEvent[],
  calendarName: string,
): string {
  const now = toUtcStamp(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TravelPlanner//Trip Export//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];

  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${now}`);
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${toDateValue(e.start)}`);
      // All-day DTEND is exclusive: a hotel checkout date used directly as
      // DTEND yields a block covering the nights (and not the checkout day),
      // so back-to-back stays don't overlap. With only a start date, span one
      // day (start+1).
      const endDate = e.end ? toDateValue(e.end) : addOneDay(e.start);
      lines.push(`DTEND;VALUE=DATE:${endDate}`);
    } else {
      lines.push(`DTSTART:${toUtcStamp(e.start)}`);
      if (e.end) lines.push(`DTEND:${toUtcStamp(e.end)}`);
    }
    lines.push(`SUMMARY:${escapeText(e.summary)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

// Filesystem-safe slug for the .ics filename.
export function icsFilename(tripName: string): string {
  const slug = tripName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${slug || "reise"}.ics`;
}
