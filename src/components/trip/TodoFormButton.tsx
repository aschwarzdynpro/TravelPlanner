"use client";

import { useState, useTransition } from "react";
import Modal from "@/components/Modal";
import type { TripTodo, Member } from "./types";
import { saveTodo } from "@/app/(app)/trips/[id]/actions";
import { Loader2 } from "@/components/icons";

export default function TodoFormButton({
  tripId,
  members,
  todo,
  label,
  className = "btn-primary",
}: {
  tripId: string;
  members: Member[];
  todo?: TripTodo;
  label: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const t = todo;

  // Only active members with a linked account can be assignees.
  const assignable = members.filter((m) => m.user_id && m.status === "active");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveTodo(fd);
      setOpen(false);
    });
  }

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t ? "Aufgabe bearbeiten" : "Aufgabe hinzufügen"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="trip_id" value={tripId} />
          {t && <input type="hidden" name="id" value={t.id} />}

          <div>
            <label className="label">Titel *</label>
            <input
              name="title"
              className="input"
              required
              autoFocus
              defaultValue={t?.title ?? ""}
              placeholder="z. B. Reisepässe prüfen"
            />
          </div>

          <div>
            <label className="label">Beschreibung</label>
            <textarea
              name="description"
              className="textarea"
              rows={3}
              defaultValue={t?.description ?? ""}
              placeholder="Details, Links, Kontext …"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Zugewiesen an</label>
              <select
                name="assigned_to"
                className="select"
                defaultValue={t?.assigned_to ?? ""}
              >
                <option value="">— niemand —</option>
                {assignable.map((m) => (
                  <option key={m.id} value={m.user_id!}>
                    {m.profiles?.display_name || m.profiles?.email || "Mitglied"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fällig bis</label>
              <input
                name="due_date"
                type="date"
                className="input"
                defaultValue={t?.due_date ?? ""}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Abbrechen
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {pending ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
