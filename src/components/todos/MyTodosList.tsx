"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, daysUntil } from "@/lib/format";
import { toggleTodo } from "@/app/(app)/trips/[id]/actions";
import { CalendarDays, ListChecks } from "@/components/icons";

export type MyTodo = {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  done: boolean;
  tripName: string | null;
  tripColor: string | null;
};

type Filter = "open" | "all";

export default function MyTodosList({ todos }: { todos: MyTodo[] }) {
  const [filter, setFilter] = useState<Filter>("open");

  const visible = filter === "open" ? todos.filter((t) => !t.done) : todos;
  const openCount = todos.filter((t) => !t.done).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-grid grid-cols-2 gap-1 rounded-lg border bg-[var(--surface)] p-1">
          {(
            [
              ["open", `Offen (${openCount})`],
              ["all", `Alle (${todos.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                filter === value
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center text-sm text-[var(--muted)]">
          <ListChecks className="h-8 w-8" strokeWidth={1.5} />
          {filter === "open"
            ? "Keine offenen Aufgaben – alles erledigt."
            : "Dir sind noch keine Aufgaben zugewiesen."}
        </div>
      ) : (
        <ul className="card divide-y">
          {visible.map((t) => {
            const left = daysUntil(t.due_date);
            const overdue = !t.done && left !== null && left < 0;
            return (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                <form action={toggleTodo} className="pt-0.5">
                  <input type="hidden" name="trip_id" value={t.trip_id} />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={(!t.done).toString()} />
                  <button
                    type="submit"
                    aria-label={t.done ? "Als offen markieren" : "Als erledigt markieren"}
                    className={`grid h-5 w-5 place-items-center rounded-md border transition ${
                      t.done
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] hover:border-[var(--ring)]"
                    }`}
                  >
                    {t.done && (
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </form>

                <div className="min-w-0 flex-1">
                  <div
                    className={`font-medium ${t.done ? "text-[var(--muted)] line-through" : ""}`}
                  >
                    {t.title}
                  </div>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {t.description}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <Link
                      href={`/trips/${t.trip_id}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      {t.tripColor && (
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: t.tripColor }}
                        />
                      )}
                      {t.tripName ?? "Reise"}
                    </Link>
                    {t.due_date && (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          overdue ? "text-red-600 dark:text-red-400" : ""
                        }`}
                      >
                        <CalendarDays className="h-3 w-3" strokeWidth={2} />
                        {formatDate(t.due_date)}
                        {overdue && " · überfällig"}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
