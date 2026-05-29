export default function TripsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-black/5 dark:bg-white/10" />
          <div className="h-4 w-24 rounded bg-black/5 dark:bg-white/10" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-black/5 dark:bg-white/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-2 bg-black/5 dark:bg-white/10" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded bg-black/5 dark:bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-black/5 dark:bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-black/5 dark:bg-white/10" />
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="h-4 w-10 rounded bg-black/5 dark:bg-white/10" />
                <div className="h-4 w-16 rounded bg-black/5 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
