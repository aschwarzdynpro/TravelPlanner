export default function TripLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-24 rounded bg-black/5 dark:bg-white/10" />
      <div className="card mb-6 overflow-hidden">
        <div className="h-2.5 bg-black/5 dark:bg-white/10" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded bg-black/5 dark:bg-white/10" />
            <div className="h-4 w-48 rounded bg-black/5 dark:bg-white/10" />
          </div>
          <div className="h-10 w-28 rounded bg-black/5 dark:bg-white/10" />
        </div>
      </div>
      <div className="mb-6 flex gap-4 border-b pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 w-20 rounded bg-black/5 dark:bg-white/10" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-32 bg-black/5 dark:bg-white/10" />
        ))}
      </div>
    </div>
  );
}
