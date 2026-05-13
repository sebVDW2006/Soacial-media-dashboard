"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Brand,
  Channel,
  ContentItem,
  ContentType,
  Format,
  Pillar,
  PostType,
  StorytellingStructure,
} from "@/lib/types";
import { PILLAR_BRAND_SLUGS, formatChannelDefaults } from "@/components/content-form/constants";
import {
  buildInitialDraft,
  formatSavedAt,
  getDraftStorageKey,
  getResolvedTargetPostAt,
  readStoredDraft,
  serializeDraft,
  type DraftFields,
} from "@/components/content-form/draft";
import { getSubPillarsForBrand } from "@/lib/taxonomy";

type UseContentFormDraftArgs = {
  item?: ContentItem | null;
  linkedChannelIds: number[];
  linkedChannelSchedules?: Record<number, string | null>;
  formats: Format[];
  pillars: Pillar[];
  channels: Channel[];
  initialBrand?: Brand;
  initialFormatId?: number;
  initialPillarId?: number;
  initialChannelIds?: number[];
  initialPostType?: PostType;
  initialTargetPostAt?: string | null;
  initialContentType?: ContentType | null;
  initialSubPillar?: string | null;
  initialStorytellingStructure?: StorytellingStructure | null;
};

function pickChannelSchedules(channelIds: number[], channelSchedules: Record<number, string>) {
  return channelIds.reduce<Record<number, string>>((acc, channelId) => {
    if (channelSchedules[channelId]) {
      acc[channelId] = channelSchedules[channelId];
    }
    return acc;
  }, {});
}

export function useContentFormDraft(args: UseContentFormDraftArgs) {
  const {
    item,
    linkedChannelIds,
    linkedChannelSchedules,
    formats,
    pillars,
    channels,
    initialBrand,
    initialFormatId,
    initialPillarId,
    initialChannelIds,
    initialPostType,
    initialTargetPostAt,
    initialContentType,
    initialSubPillar,
    initialStorytellingStructure,
  } = args;
  const formatLookup = useMemo(
    () => new Map(formats.map((format) => [format.id, format])),
    [formats],
  );
  const initialDraft = useMemo(
    () =>
      buildInitialDraft(
        {
          item,
          linkedChannelIds,
          linkedChannelSchedules,
          initialBrand,
          initialFormatId,
          initialPillarId,
          initialChannelIds,
          initialPostType,
          initialTargetPostAt,
          initialContentType,
          initialSubPillar,
          initialStorytellingStructure,
        },
        formats,
        pillars,
        channels,
      ),
    [
      channels,
      formats,
      initialBrand,
      initialChannelIds,
      initialContentType,
      initialFormatId,
      initialPillarId,
      initialPostType,
      initialStorytellingStructure,
      initialSubPillar,
      initialTargetPostAt,
      item,
      linkedChannelIds,
      linkedChannelSchedules,
      pillars,
    ],
  );
  const draftStorageKey = useMemo(() => getDraftStorageKey(item?.id), [item?.id]);
  const initialDraftSignature = useMemo(() => serializeDraft(initialDraft), [initialDraft]);
  const [draft, setDraft] = useState(initialDraft);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [recoveredDraftAt, setRecoveredDraftAt] = useState<string | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [backupFailed, setBackupFailed] = useState(false);

  const visiblePillars = useMemo(
    () => pillars.filter((pillar) => PILLAR_BRAND_SLUGS[draft.brand].includes(pillar.slug)),
    [draft.brand, pillars],
  );
  const visibleSubPillars = useMemo(
    () => getSubPillarsForBrand(draft.brand),
    [draft.brand],
  );
  const resolvedTargetPostAt = useMemo(() => getResolvedTargetPostAt(draft), [draft]);
  const currentDraftSignature = useMemo(() => serializeDraft(draft), [draft]);
  const backupLabel = backupFailed
    ? "Auto-backup is unavailable in this browser right now."
    : recoveredDraftAt
      ? `Recovered your unsaved draft from ${formatSavedAt(recoveredDraftAt)}.`
      : lastBackupAt
        ? `Auto-backed up locally at ${formatSavedAt(lastBackupAt)}.`
        : "Drafts back up automatically here while you type.";

  const setField = <Key extends keyof DraftFields>(field: Key, value: DraftFields[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const storedDraft = readStoredDraft({
      storageKey: draftStorageKey,
      fallback: initialDraft,
      formats,
      pillars,
      channels,
    });

    if (storedDraft) {
      if (serializeDraft(storedDraft) === initialDraftSignature) {
        window.localStorage.removeItem(draftStorageKey);
      } else {
        setDraft(storedDraft);
        setRecoveredDraftAt(storedDraft.savedAt);
        setLastBackupAt(storedDraft.savedAt);
      }
    }

    setHasHydratedDraft(true);
  }, [channels, draftStorageKey, formats, initialDraft, initialDraftSignature, pillars]);

  useEffect(() => {
    if (!hasHydratedDraft) return;

    try {
      if (currentDraftSignature === initialDraftSignature) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }

      const savedAt = new Date().toISOString();
      window.localStorage.setItem(draftStorageKey, JSON.stringify({ ...draft, savedAt }));
      setLastBackupAt(savedAt);
      setBackupFailed(false);
    } catch {
      setBackupFailed(true);
    }
  }, [currentDraftSignature, draft, draftStorageKey, hasHydratedDraft, initialDraftSignature]);

  const applyFormat = (nextFormatId: number) => {
    const nextFormat = formatLookup.get(nextFormatId);

    setDraft((current) => {
      const selectedChannels = current.selectedChannels.length
        ? current.selectedChannels
        : formatChannelDefaults(nextFormat, channels).filter(
            (channelId) => channels.find((channel) => channel.id === channelId)?.brand === current.brand,
          );
      const channelSchedules = { ...current.channelSchedules };

      for (const channelId of selectedChannels) {
        if (!channelSchedules[channelId] && resolvedTargetPostAt) {
          channelSchedules[channelId] = resolvedTargetPostAt;
        }
      }

      return {
        ...current,
        formatId: nextFormatId,
        selectedChannels,
        channelSchedules,
        hook: current.hook.trim() ? current.hook : (nextFormat?.hook_template ?? ""),
        body: current.body.trim() ? current.body : (nextFormat?.body_template ?? ""),
        close: current.close.trim() ? current.close : (nextFormat?.close_template ?? ""),
      };
    });
  };

  const handleBrandChange = (nextBrand: Brand) => {
    setDraft((current) => {
      const selectedChannels = current.selectedChannels.filter(
        (channelId) => channels.find((channel) => channel.id === channelId)?.brand === nextBrand,
      );
      const currentPillarIsVisible = visiblePillars.some((pillar) => pillar.id === current.pillarId);
      const nextPillarId =
        currentPillarIsVisible && current.brand === nextBrand
          ? current.pillarId
          : (pillars.find((pillar) => PILLAR_BRAND_SLUGS[nextBrand].includes(pillar.slug))?.id ??
            current.pillarId);

      const subPillarsForNextBrand = getSubPillarsForBrand(nextBrand);
      const nextSubPillar =
        current.subPillar && subPillarsForNextBrand.some((sp) => sp.slug === current.subPillar)
          ? current.subPillar
          : null;

      return {
        ...current,
        brand: nextBrand,
        pillarId: nextPillarId,
        subPillar: nextSubPillar,
        selectedChannels,
        channelSchedules: pickChannelSchedules(selectedChannels, current.channelSchedules),
      };
    });
  };

  const toggleChannel = (channelId: number) => {
    setDraft((current) => {
      if (current.selectedChannels.includes(channelId)) {
        const selectedChannels = current.selectedChannels.filter((id) => id !== channelId);
        return {
          ...current,
          selectedChannels,
          channelSchedules: pickChannelSchedules(selectedChannels, current.channelSchedules),
        };
      }

      return {
        ...current,
        selectedChannels: [...current.selectedChannels, channelId],
        channelSchedules: current.channelSchedules[channelId]
          ? current.channelSchedules
          : {
              ...current.channelSchedules,
              [channelId]: getResolvedTargetPostAt(current),
            },
      };
    });
  };

  const setChannelDate = (channelId: number, value: string) => {
    setDraft((current) => ({
      ...current,
      channelSchedules: { ...current.channelSchedules, [channelId]: value },
    }));
  };

  const discardRecoveredDraft = () => {
    setDraft(initialDraft);
    window.localStorage.removeItem(draftStorageKey);
    setRecoveredDraftAt(null);
    setLastBackupAt(null);
    setBackupFailed(false);
  };

  return {
    draft,
    visiblePillars,
    visibleSubPillars,
    resolvedTargetPostAt,
    backupLabel,
    recoveredDraftAt,
    setField,
    applyFormat,
    handleBrandChange,
    toggleChannel,
    setChannelDate,
    discardRecoveredDraft,
  };
}
