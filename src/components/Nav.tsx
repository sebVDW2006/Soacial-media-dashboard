"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const primaryLinks = [
  ["/", "Dashboard"],
  ["/content", "Content pieces"],
  ["/calendar", "Schedule"],
  ["/pipeline", "Post flow"],
  ["/kpis", "Track data"],
];

const utilityLinks = [
  ["/inbox", "Inbox"],
  ["/capture", "Capture day"],
  ["/assets", "Assets"],
  ["/settings", "Settings"],
];

function buildBrandToggleUrl(pathname: string, searchParams: URLSearchParams, brand: string) {
  const params = new URLSearchParams(searchParams.toString());

  if (brand === "all") {
    params.delete("brand");
  } else {
    params.set("brand", brand);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildSectionUrl(pathname: string, brand: string) {
  if (brand === "all") return pathname;
  return `${pathname}?brand=${brand}`;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? "all";

  return (
    <nav className="top-nav">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 py-5 lg:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="text-[2rem] font-semibold tracking-[-0.08em] text-[var(--brand)]">
            Content Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-3 rounded-full border border-[var(--line)] bg-white/70 p-2 shadow-sm">
              {(["all", "seb", "ublend"] as const).map((option) => (
                <Link
                  key={option}
                  href={buildBrandToggleUrl(pathname, new URLSearchParams(searchParams.toString()), option)}
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

        <div className="flex flex-wrap items-center gap-3 rounded-[34px] border border-[var(--line)] bg-white/70 p-2 shadow-sm">
          {primaryLinks.map(([href, label]) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={buildSectionUrl(href, brand)}
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

        <div className="flex flex-wrap items-center gap-4">
          {utilityLinks.map(([href, label]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={buildSectionUrl(href, brand)}
                className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${
                  active ? "text-[var(--brand)]" : "text-[var(--ink-soft)] hover:text-[var(--brand)]"
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
