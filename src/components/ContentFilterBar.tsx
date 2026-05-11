"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Option = { value: string; label: string };

type ContentFilterBarProps = {
  search: string;
  sort: string;
  formatId: string;
  pillarId: string;
  channelId: string;
  formats: Option[];
  pillars: Option[];
  channels: Option[];
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
  formats,
  pillars,
  channels,
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

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
      <div>
        <label htmlFor="content-search">Search</label>
        <input
          id="content-search"
          type="search"
          placeholder="Title, format, pillar, hook, notes…"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          autoComplete="off"
        />
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
      <div>
        <label htmlFor="content-format">Format</label>
        <select
          id="content-format"
          value={formatId}
          onChange={(event) => pushParams({ format: event.target.value === "all" ? null : event.target.value })}
        >
          <option value="all">All formats</option>
          {formats.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="content-pillar">Pillar</label>
        <select
          id="content-pillar"
          value={pillarId}
          onChange={(event) => pushParams({ pillar: event.target.value === "all" ? null : event.target.value })}
        >
          <option value="all">All pillars</option>
          {pillars.map((option) => (
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
    </div>
  );
}
