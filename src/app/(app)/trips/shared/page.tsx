import TripsList from "@/components/trips/TripsList";

export const dynamic = "force-dynamic";

export default function SharedTripsPage() {
  return (
    <TripsList
      scope="shared"
      title="Geteilte Reisen"
      subtitle="Reisen, zu denen du als Mitglied eingeladen wurdest"
      emptyTitle="Noch keine geteilten Reisen"
      emptyText="Sobald dich jemand zu einer Reise einlädt, erscheint sie hier. Eingeladene Reisen kannst du je nach Rolle ansehen oder mitbearbeiten."
    />
  );
}
