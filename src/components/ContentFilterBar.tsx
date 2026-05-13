"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CONTENT_TYPES } from "@/lib/taxonomy";

type Option = { value: string; label: string };

type ContentFilterBarProps = {
  search: string;
  sort: string;
  formatId: string;
  pillarId: string;
  channelId: string;
  contentType: string;
  subPillar: string;
  weekIso: string;
  formats: Option[];
  pillars: Option[];
  channels: Option[];
  subPillars: Option[];
};

const SORT_OPTIONS: Option[] = [
  { value: "scheduled", label: "Nearest scheduled" },
  { value: "created", label: "Newest created" },
  { value: "posted", label: "Recently posted" },
  { value: "edited", label: "Last edited" },
];

export function ContentFilterBar({
  search,
  sort,
  formatId,
  pillarId,
  channelId,
  contentType,
  subPillar,
  weekIso,
  formats,
  pillars,
  channels,
  subPillars,
}: ContentFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (searchValue === search) return;
    const handle = setTimeout(() => {
      pushParams({ q: searchValue.trim() ? searchValue.trim() : null });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  void pillarId;
  void pillars;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <label htmlFor="content-search">Search</label>
          <input
            id="content-search"
            type="search"
            placeholder="Title, framework, sub-pillar, hook, notes…"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="content-content-type">Content Type</label>
          <select
            id="content-content-type"
            value={contentType}
            onChange={(event) =>
              pushParams({ contentType: event.target.value === "all" ? null : event.target.value })
            }
          >
            <option value="all">All types</option>
            {CONTENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content-sub-pillar">Sub-Pillar</label>
          <select
            id="content-sub-pillar"
            value={subPillar}
            onChange={(event) =>
              pushParams({ subPillar: event.target.value === "all" ? null : event.target.value })
            }
          >
            <option value="all">All sub-pillars</option>
            {subPillars.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content-sort">Sort</label>
          <select
            id="content-sort"
            value={sort}
            onChange={(event) => pushParams({ sort: event.target.value === "scheduled" ? null : event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <div>
          <label htmlFor="content-format">Post Framework</label>
          <select
            id="content-format"
            value={formatId}
            onChange={(event) => pushParams({ format: event.target.value === "all" ? null : event.target.value })}
          >
            <option value="all">All frameworks</option>
            {formats.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content-channel">Channel</label>
          <select
            id="content-channel"
            value={channelId}
            onChange={(event) => pushParams({ channel: event.target.value === "all" ? null : event.target.value })}
          >
            <option value="all">All channels</option>
            {channels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content-week">Week</label>
          <input
            id="content-week"
            type="week"
            value={weekIso === "all" ? "" : weekIso}
            onChange={(event) =>
              pushParams({ week: event.target.value ? event.target.value : null })
            }
          />
        </div>
      </div>
    </div>
  );
}
