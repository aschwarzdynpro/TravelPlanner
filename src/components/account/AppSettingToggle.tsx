"use client";

import { useState, useTransition } from "react";
import { setAppSetting } from "@/app/(app)/account/actions";

// Admin on/off switch for a global app_settings flag.
export default function AppSettingToggle({
  settingKey,
  initial,
}: {
  settingKey: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(() => setAppSetting(settingKey, next));
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition disabled:opacity-60 ${
        on ? "bg-[var(--primary)]" : "bg-black/20 dark:bg-white/20"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}
