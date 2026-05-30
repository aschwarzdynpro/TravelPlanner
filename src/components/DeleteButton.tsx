"use client";

type Action = (formData: FormData) => void | Promise<void>;

export default function DeleteButton({
  action,
  id,
  tripId,
  label = "Löschen",
  title,
  confirmText = "Wirklich löschen?",
  className = "text-xs text-red-600 hover:underline",
}: {
  action: Action;
  id: string;
  tripId: string;
  // Accepts an icon (or any node), not just text.
  label?: React.ReactNode;
  // Tooltip / accessible name — useful when label is an icon only.
  title?: string;
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
      <button
        type="submit"
        className={className}
        title={title}
        aria-label={title}
      >
        {label}
      </button>
    </form>
  );
}
