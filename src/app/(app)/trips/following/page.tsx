export const dynamic = "force-dynamic";

export default function FollowingTripsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Follow-Up Reisen</h1>
        <p className="text-sm text-[var(--muted)]">
          Reisen anderer, denen du folgst
        </p>
      </div>

      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="text-5xl">📡</div>
        <h2 className="text-lg font-semibold">Folgen kommt bald</h2>
        <p className="max-w-md text-sm text-[var(--muted)]">
          Aktuell kannst du Reisen über einen geteilten „Follow-Me“-Link
          schreibgeschützt verfolgen. Bald kannst du Reisen direkt folgen, sodass
          sie hier gesammelt erscheinen und du Aktualisierungen im Blick behältst.
        </p>
      </div>
    </div>
  );
}
