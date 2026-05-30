"use client";

import { useState, useTransition } from "react";
import { followTrip, unfollowTrip } from "@/app/(app)/trips/actions";
import { Bell, Check } from "@/components/icons";

// Follow / unfollow toggle on the public Follow-Me page (for signed-in users
// who aren't members). Followed trips appear under "Follow-Up Reisen".
export default function FollowButton({
  tripId,
  initialFollowing,
}: {
  tripId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    const fd = new FormData();
    fd.set("trip_id", tripId);
    startTransition(async () => {
      if (next) await followTrip(fd);
      else await unfollowTrip(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30 disabled:opacity-60"
    >
      {following ? (
        <>
          <Check className="h-4 w-4" strokeWidth={2} />
          Du folgst dieser Reise
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" strokeWidth={2} />
          Dieser Reise folgen
        </>
      )}
    </button>
  );
}
