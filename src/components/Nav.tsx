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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 py-5 lg:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <Link href="/" className="text-[2rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
              Content OS
            </Link>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              Seb x uBlend creative operating system. Capture source material, shape it into formats, and publish with
              intention.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">Creative system</span>
              <span className="chip">Tuesday-led workflow</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-full border border-[var(--line)] bg-white/70 p-2 shadow-sm">
              {(["all", "seb", "ublend"] as const).map((option) => (
                <Link
                  key={option}
                  href={buildUrl(pathname, new URLSearchParams(searchParams.toString()), option)}
                  className={`rounded-full px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${
                    brand === option
                      ? "bg-[var(--brand)] text-white"
                      : "text-[var(--ink)] hover:bg-[var(--brand)] hover:text-white"
                  }`}
                >
                  {option === "all" ? "All brands" : option === "seb" ? "Seb" : "uBlend"}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-[34px] border border-[var(--line)] bg-white/70 p-2 shadow-sm">
          {links.map(([href, label]) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${
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
    </nav>
  );
}
