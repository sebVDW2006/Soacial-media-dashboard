"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  ["/", "Dashboard"],
  ["/inbox", "Inbox"],
  ["/calendar", "Calendar"],
  ["/pipeline", "Pipeline"],
  ["/capture", "Capture"],
  ["/assets", "Assets"],
  ["/formats", "Formats"],
  ["/kpis", "KPIs"],
  ["/reviews", "Reviews"],
  ["/settings", "Settings"],
];

function buildUrl(pathname: string, searchParams: URLSearchParams, brand: string) {
  const params = new URLSearchParams(searchParams.toString());

  if (brand === "all") {
    params.delete("brand");
  } else {
    params.set("brand", brand);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? "all";

  return (
    <nav className="top-nav">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-[1.85rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
          Content OS
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 p-1.5 shadow-sm">
            {(["all", "seb", "ublend"] as const).map((option) => (
              <Link
                key={option}
                href={buildUrl(pathname, new URLSearchParams(searchParams.toString()), option)}
                className={`rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${
                  brand === option
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--ink)] hover:bg-[var(--brand)] hover:text-white"
                }`}
              >
                {option === "all" ? "All brands" : option === "seb" ? "Seb" : "uBlend"}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 p-1.5 shadow-sm">
            {links.map(([href, label]) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${
                    active
                      ? "bg-[var(--brand)] text-white"
                      : "text-[var(--ink)] hover:bg-[var(--brand)] hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
