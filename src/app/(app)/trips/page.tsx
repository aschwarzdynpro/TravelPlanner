import TripsList from "@/components/trips/TripsList";

export const dynamic = "force-dynamic";

export default function MyTripsPage() {
  return (
    <TripsList
      scope="owned"
      title="Meine Reisen"
      emptyTitle="Noch keine Reise geplant"
      emptyText="Lege deine erste Reise oder dein erstes Event an und lade Mitreisende zur gemeinsamen Planung ein."
      showNewButton
    />
  );
}
