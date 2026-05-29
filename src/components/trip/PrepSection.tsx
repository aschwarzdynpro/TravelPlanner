"use client";

import { useState, useTransition } from "react";
import type { WorkspaceData, TripTodo } from "./types";
import { formatDate, daysUntil, initials } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import TodoFormButton from "./TodoFormButton";
import { saveNote, toggleTodo, deleteTodo } from "@/app/(app)/trips/[id]/actions";
import {
  Plus,
  StickyNote,
  ListChecks,
  CalendarDays,
  Pencil,
  Loader2,
} from "@/components/icons";

function TodoRow({
  todo,
  tripId,
  canEdit,
  members,
}: {
  todo: TripTodo;
  tripId: string;
  canEdit: boolean;
  members: WorkspaceData["members"];
}) {
  const left = daysUntil(todo.due_date);
  const overdue = !todo.done && left !== null && left < 0;
  const assignee =
    todo.assignee?.display_name || todo.assignee?.email || null;

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      {/* Toggle done */}
      <form action={toggleTodo} className="pt-0.5">
        <input type="hidden" name="trip_id" value={tripId} />
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="done" value={(!todo.done).toString()} />
        <button
          type="submit"
          disabled={!canEdit}
          aria-label={todo.done ? "Als offen markieren" : "Als erledigt markieren"}
          className={`grid h-5 w-5 place-items-center rounded-md border transition ${
            todo.done
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] hover:border-[var(--ring)]"
          } ${canEdit ? "cursor-pointer" : "cursor-default"}`}
        >
          {todo.done && (
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
          className={`font-medium ${todo.done ? "text-[var(--muted)] line-through" : ""}`}
        >
          {todo.title}
        </div>
        {todo.description && (
          <p className="mt-0.5 text-sm text-[var(--muted)]">{todo.description}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          {assignee && (
            <span className="inline-flex items-center gap-1">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--primary)] text-[8px] font-semibold text-[var(--primary-foreground)]">
                {initials(assignee)}
              </span>
              {assignee}
            </span>
          )}
          {todo.due_date && (
            <span
              className={`inline-flex items-center gap-1 ${
                overdue ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              <CalendarDays className="h-3 w-3" strokeWidth={2} />
              {formatDate(todo.due_date)}
              {overdue && " · überfällig"}
            </span>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex shrink-0 items-center gap-2">
          <TodoFormButton
            tripId={tripId}
            members={members}
            todo={todo}
            label={<Pencil className="h-3.5 w-3.5" strokeWidth={2} />}
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/5"
          />
          <DeleteButton
            action={deleteTodo}
            id={todo.id}
            tripId={tripId}
            confirmText={`Aufgabe „${todo.title}" löschen?`}
          />
        </div>
      )}
    </li>
  );
}

export default function PrepSection({
  trip,
  notes,
  todos,
  members,
  canEdit,
}: WorkspaceData) {
  const note = notes[0] ?? null; // single shared note pad per trip
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, startSaveNote] = useTransition();

  function handleSaveNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSaveNote(async () => {
      await saveNote(fd);
      setEditingNote(false);
    });
  }

  const openTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);

  return (
    <div className="space-y-6">
      {/* To-dos */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <ListChecks className="h-4 w-4" strokeWidth={2} />
            Checkliste
            <span className="text-sm font-normal text-[var(--muted)]">
              {openTodos.length} offen
            </span>
          </h3>
          {canEdit && (
            <TodoFormButton
              tripId={trip.id}
              members={members}
              label={
                <>
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Aufgabe
                </>
              }
              className="btn-primary px-3 py-1.5 text-sm"
            />
          )}
        </div>

        {todos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-[var(--muted)]">
            <ListChecks className="h-8 w-8" strokeWidth={1.5} />
            Noch keine Aufgaben. Lege Punkte an, die vor der Reise erledigt werden
            müssen – und hake sie ab.
          </div>
        ) : (
          <ul className="divide-y">
            {openTodos.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                tripId={trip.id}
                canEdit={canEdit}
                members={members}
              />
            ))}
            {doneTodos.length > 0 && (
              <li className="bg-black/[0.02] px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--muted)] dark:bg-white/[0.02]">
                Erledigt ({doneTodos.length})
              </li>
            )}
            {doneTodos.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                tripId={trip.id}
                canEdit={canEdit}
                members={members}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Notes */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <StickyNote className="h-4 w-4" strokeWidth={2} />
            Notizen
          </h3>
          {canEdit && !editingNote && (
            <button
              type="button"
              onClick={() => setEditingNote(true)}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              Bearbeiten
            </button>
          )}
        </div>

        {editingNote ? (
          <form onSubmit={handleSaveNote} className="space-y-3">
            <input type="hidden" name="trip_id" value={trip.id} />
            {note && <input type="hidden" name="id" value={note.id} />}
            <textarea
              name="content"
              className="textarea"
              rows={8}
              defaultValue={note?.content ?? ""}
              placeholder="Gemeinsame Notizen zur Reise – Packliste, Ideen, Absprachen …"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditingNote(false)}
                disabled={savingNote}
              >
                Abbrechen
              </button>
              <button type="submit" className="btn-primary" disabled={savingNote}>
                {savingNote && (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                )}
                {savingNote ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </form>
        ) : note && note.content.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {note.content}
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Noch keine Notizen.
            {canEdit && " Klicke auf „Bearbeiten“, um welche zu hinterlegen."}
          </p>
        )}
      </div>
    </div>
  );
}
