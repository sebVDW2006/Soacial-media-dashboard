"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 60_000;
const LOADED_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev";

export function VersionWatcher() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    if (LOADED_VERSION === "dev") return;

    let cancelled = false;

    const check = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (!cancelled && data.version && data.version !== LOADED_VERSION) {
          setLatestVersion(data.version);
        }
      } catch {
        // network blip — try again next tick
      }
    };

    void check();
    const id = window.setInterval(check, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  if (!latestVersion) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3"
    >
      <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow-lg">
        <span>New version available</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--ink)]"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
