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
    <header className="top-nav">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold tracking-[-0.08em] text-leaf">
            Content OS
          </Link>
          <div className="hidden gap-2 lg:flex">
            {(["all", "seb", "ublend"] as const).map((option) => (
              <Link
                key={option}
                href={buildUrl(pathname, new URLSearchParams(searchParams.toString()), option)}
                className={`chip ${brand === option ? "active" : ""}`}
              >
                {option === "all" ? "All brands" : option === "seb" ? "Seb" : "uBlend"}
              </Link>
            ))}
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {links.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`chip whitespace-nowrap ${active ? "active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

