"use client";

type Action = (formData: FormData) => void | Promise<void>;

export default function DeleteButton({
  action,
  id,
  tripId,
  label = "Löschen",
  confirmText = "Wirklich löschen?",
  className = "text-xs text-red-600 hover:underline",
}: {
  action: Action;
  id: string;
  tripId: string;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="trip_id" value={tripId} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
