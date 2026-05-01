import type { Brand, Channel, ContentItem, Format, Pillar, PostType } from "@/lib/types";
import {
  PILLAR_BRAND_SLUGS,
  POST_TYPE_OPTIONS,
  formatChannelDefaults,
} from "@/components/content-form/constants";

const NEW_DRAFT_STORAGE_KEY = "content-os:content-draft:new";
const POST_TYPE_VALUES = new Set<PostType>(POST_TYPE_OPTIONS.map((option) => option.value));

export type DraftFields = {
  title: string;
  formatId: number;
  postType: PostType;
  brand: Brand;
  pillarId: number;
  targetPostAt: string;
  selectedChannels: number[];
  channelSchedules: Record<number, string>;
  hook: string;
  body: string;
  close: string;
  notes: string;
};

type StoredDraft = DraftFields & {
  savedAt: string;
};

type BuildInitialDraftArgs = {
  item?: ContentItem | null;
  linkedChannelIds: number[];
  linkedChannelSchedules?: Record<number, string | null>;
  initialBrand?: Brand;
  initialFormatId?: number;
  initialPillarId?: number;
  initialChannelIds?: number[];
  initialPostType?: PostType;
  initialTargetPostAt?: string | null;
};

function isBrand(value: unknown): value is Brand {
  return value === "seb" || value === "ublend";
}

function isPostType(value: unknown): value is PostType {
  return typeof value === "string" && POST_TYPE_VALUES.has(value as PostType);
}

function buildChannelLookup(channels: Channel[]) {
  return new Map(channels.map((channel) => [channel.id, channel]));
}

function filterBrandChannelIds(
  channelIds: number[],
  channelLookup: Map<number, Channel>,
  brand: Brand,
) {
  return [...new Set(channelIds)].filter((id) => channelLookup.get(id)?.brand === brand);
}

function getBrandPillarIds(pillars: Pillar[], brand: Brand) {
  return pillars
    .filter((pillar) => PILLAR_BRAND_SLUGS[brand].includes(pillar.slug))
    .map((pillar) => pillar.id);
}

function getValidPillarId(pillarId: number, pillars: Pillar[], brand: Brand) {
  const brandPillarIds = getBrandPillarIds(pillars, brand);
  return brandPillarIds.includes(pillarId) ? pillarId : (brandPillarIds[0] ?? pillarId);
}

function buildInitialSelectedChannels(
  args: BuildInitialDraftArgs,
  brand: Brand,
  activeFormatId: number,
  channels: Channel[],
  formats: Format[],
) {
  const channelLookup = buildChannelLookup(channels);

  if (args.linkedChannelIds.length) {
    return filterBrandChannelIds(args.linkedChannelIds, channelLookup, brand);
  }

  if (args.initialChannelIds?.length) {
    return filterBrandChannelIds(args.initialChannelIds, channelLookup, brand);
  }

  const formatLookup = new Map(formats.map((format) => [format.id, format]));
  return filterBrandChannelIds(
    formatChannelDefaults(formatLookup.get(activeFormatId), channels),
    channelLookup,
    brand,
  );
}

function buildInitialChannelSchedules(
  selectedChannelIds: number[],
  linkedChannelSchedules: Record<number, string | null> | undefined,
  fallbackTargetPostAt: string,
) {
  const schedules: Record<number, string> = {};

  for (const channelId of selectedChannelIds) {
    const linkedSchedule = linkedChannelSchedules?.[channelId];
    if (linkedSchedule) {
      schedules[channelId] = linkedSchedule.slice(0, 16);
      continue;
    }

    if (fallbackTargetPostAt) {
      schedules[channelId] = fallbackTargetPostAt;
    }
  }

  return schedules;
}

export function buildInitialDraft(
  args: BuildInitialDraftArgs,
  formats: Format[],
  pillars: Pillar[],
  channels: Channel[],
): DraftFields {
  const activeFormatId = args.item?.format_id ?? args.initialFormatId ?? formats[0]?.id ?? 1;
  const initialBrand = args.item?.brand ?? args.initialBrand ?? "seb";
  const initialPillarId = args.item?.pillar_id ?? args.initialPillarId ?? pillars[0]?.id ?? 1;
  const selectedChannels = buildInitialSelectedChannels(
    args,
    initialBrand,
    activeFormatId,
    channels,
    formats,
  );
  const targetPostAt = args.initialTargetPostAt ?? args.item?.target_post_at?.slice(0, 16) ?? "";

  return {
    title: args.item?.title ?? "",
    formatId: activeFormatId,
    postType: args.item?.post_type ?? args.initialPostType ?? "single-image",
    brand: initialBrand,
    pillarId: getValidPillarId(initialPillarId, pillars, initialBrand),
    targetPostAt,
    selectedChannels,
    channelSchedules: buildInitialChannelSchedules(
      selectedChannels,
      args.linkedChannelSchedules,
      targetPostAt,
    ),
    hook: args.item?.hook ?? "",
    body: args.item?.body ?? "",
    close: args.item?.close ?? "",
    notes: args.item?.notes ?? "",
  };
}

export function getDraftStorageKey(contentId?: number) {
  return contentId ? `content-os:content-draft:${contentId}` : NEW_DRAFT_STORAGE_KEY;
}

export function serializeDraft(draft: DraftFields) {
  const selectedChannels = [...new Set(draft.selectedChannels)].sort((left, right) => left - right);
  const channelSchedules: Record<number, string> = {};

  for (const channelId of selectedChannels) {
    if (draft.channelSchedules[channelId]) {
      channelSchedules[channelId] = draft.channelSchedules[channelId];
    }
  }

  return JSON.stringify({
    ...draft,
    selectedChannels,
    channelSchedules,
  });
}

export function formatSavedAt(savedAt: string | null) {
  if (!savedAt) return null;

  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "just now";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getResolvedTargetPostAt(
  draft: Pick<DraftFields, "targetPostAt" | "selectedChannels" | "channelSchedules">,
) {
  const scheduledDates = draft.selectedChannels
    .map((channelId) => draft.channelSchedules[channelId])
    .filter((value): value is string => Boolean(value));

  if (!scheduledDates.length) {
    return draft.targetPostAt;
  }

  return scheduledDates.reduce((earliest, current) => (current < earliest ? current : earliest));
}

export function readStoredDraft({
  storageKey,
  fallback,
  formats,
  pillars,
  channels,
}: {
  storageKey: string;
  fallback: DraftFields;
  formats: Format[];
  pillars: Pillar[];
  channels: Channel[];
}) {
  const rawDraft = window.localStorage.getItem(storageKey);
  if (!rawDraft) return null;

  try {
    const parsed = JSON.parse(rawDraft) as Partial<StoredDraft> & {
      channelSchedules?: unknown;
      selectedChannels?: unknown;
    };
    const brand = isBrand(parsed.brand) ? parsed.brand : fallback.brand;
    const validFormatIds = new Set(formats.map((format) => format.id));
    const validPillarIds = new Set(getBrandPillarIds(pillars, brand));
    const channelLookup = buildChannelLookup(channels);
    const selectedChannels = Array.isArray(parsed.selectedChannels)
      ? filterBrandChannelIds(
          parsed.selectedChannels.map((value) => Number(value)).filter(Number.isFinite),
          channelLookup,
          brand,
        )
      : fallback.selectedChannels;
    const selectedChannelIds = new Set(selectedChannels);
    const channelSchedules =
      parsed.channelSchedules && typeof parsed.channelSchedules === "object"
        ? Object.entries(parsed.channelSchedules as Record<string, unknown>).reduce<
            Record<number, string>
          >((acc, [key, value]) => {
            const channelId = Number(key);
            if (
              Number.isFinite(channelId) &&
              selectedChannelIds.has(channelId) &&
              typeof value === "string" &&
              value
            ) {
              acc[channelId] = value;
            }
            return acc;
          }, {})
        : fallback.channelSchedules;

    return {
      title: typeof parsed.title === "string" ? parsed.title : fallback.title,
      formatId:
        typeof parsed.formatId === "number" && validFormatIds.has(parsed.formatId)
          ? parsed.formatId
          : fallback.formatId,
      postType: isPostType(parsed.postType) ? parsed.postType : fallback.postType,
      brand,
      pillarId:
        typeof parsed.pillarId === "number" && validPillarIds.has(parsed.pillarId)
          ? parsed.pillarId
          : fallback.pillarId,
      targetPostAt:
        typeof parsed.targetPostAt === "string" ? parsed.targetPostAt : fallback.targetPostAt,
      selectedChannels,
      channelSchedules,
      hook: typeof parsed.hook === "string" ? parsed.hook : fallback.hook,
      body: typeof parsed.body === "string" ? parsed.body : fallback.body,
      close: typeof parsed.close === "string" ? parsed.close : fallback.close,
      notes: typeof parsed.notes === "string" ? parsed.notes : fallback.notes,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    } satisfies StoredDraft;
  } catch {
    return null;
  }
}
