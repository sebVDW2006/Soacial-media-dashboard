"use client";

import type {
  Asset,
  Channel,
  ContentItem,
  ContentType,
  Format,
  Pillar,
  PostType,
  StorytellingStructure,
} from "@/lib/types";
import { ContentBasicsSection } from "@/components/content-form/ContentBasicsSection";
import { ContentWritingSection } from "@/components/content-form/ContentWritingSection";
import { ChannelScheduleSection } from "@/components/content-form/ChannelScheduleSection";
import { SmartTemplatePanel } from "@/components/content-form/SmartTemplatePanel";
import { StorytellingStructureField } from "@/components/content-form/StorytellingStructureField";
import { useContentFormDraft } from "@/components/content-form/useContentFormDraft";

export function ContentForm({
  action,
  item,
  linkedChannelIds,
  linkedChannelSchedules,
  linkedAssetIds,
  formats,
  pillars,
  channels,
  assets,
  initialBrand,
  initialFormatId,
  initialPillarId,
  initialChannelIds,
  initialPostType,
  initialTargetPostAt,
  initialWeekIso,
  initialContentType,
  initialSubPillar,
  initialStorytellingStructure,
}: {
  action: (formData: FormData) => Promise<void>;
  item?: ContentItem | null;
  linkedChannelIds: number[];
  linkedChannelSchedules?: Record<number, string | null>;
  linkedAssetIds: number[];
  formats: Format[];
  pillars: Pillar[];
  channels: Channel[];
  assets: Asset[];
  initialBrand?: "seb" | "ublend";
  initialFormatId?: number;
  initialPillarId?: number;
  initialChannelIds?: number[];
  initialPostType?: PostType;
  initialTargetPostAt?: string | null;
  initialWeekIso?: string | null;
  initialContentType?: ContentType | null;
  initialSubPillar?: string | null;
  initialStorytellingStructure?: StorytellingStructure | null;
}) {
  const {
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
    clearStoredDraft,
  } = useContentFormDraft({
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
  });

  void linkedAssetIds; // assets aren't wired into the rebuilt form yet; preserve API for callers
  void assets;

  return (
    <form action={action} onSubmit={clearStoredDraft} className="space-y-6">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      {initialWeekIso ? <input type="hidden" name="week_iso" value={initialWeekIso} /> : null}
      <input type="hidden" name="status" value={draft.status} />

      <ContentBasicsSection
        title={draft.title}
        formatId={draft.formatId}
        postType={draft.postType}
        pillarId={draft.pillarId}
        brand={draft.brand}
        contentType={draft.contentType}
        subPillar={draft.subPillar}
        formats={formats}
        visiblePillars={visiblePillars}
        visibleSubPillars={visibleSubPillars}
        onTitleChange={(value) => setField("title", value)}
        onFormatChange={applyFormat}
        onPostTypeChange={(value) => setField("postType", value)}
        onBrandChange={handleBrandChange}
        onContentTypeChange={(value) => setField("contentType", value)}
        onSubPillarChange={(value) => setField("subPillar", value)}
      />

      {draft.contentType === "storytelling" ? (
        <section className="app-card space-y-3 p-6 sm:p-7">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="sub-title">Story arc</h2>
            <span className="chip">Storytelling</span>
          </header>
          <StorytellingStructureField
            brand={draft.brand}
            contentType={draft.contentType}
            frameworkSlug={
              formats.find((f) => f.id === draft.formatId)?.slug ?? null
            }
            value={draft.storytellingStructure}
            onChange={(value) => setField("storytellingStructure", value)}
            variant="prominent"
          />
        </section>
      ) : null}

      <ChannelScheduleSection
        channels={channels}
        brand={draft.brand}
        selectedChannelIds={draft.selectedChannels}
        channelSchedules={draft.channelSchedules}
        targetPostAt={resolvedTargetPostAt}
        onToggleChannel={toggleChannel}
        onChannelDateChange={setChannelDate}
      />

      {draft.contentType !== "storytelling" ? (
        <section className="app-card p-6 sm:p-7">
          <StorytellingStructureField
            brand={draft.brand}
            contentType={draft.contentType}
            frameworkSlug={
              formats.find((f) => f.id === draft.formatId)?.slug ?? null
            }
            value={draft.storytellingStructure}
            onChange={(value) => setField("storytellingStructure", value)}
            variant="collapsed"
          />
        </section>
      ) : null}

      {draft.storytellingStructure ? null : (
        <SmartTemplatePanel
          contentType={draft.contentType}
          storytellingStructure={draft.storytellingStructure}
          hookEmpty={!draft.hook.trim()}
          bodyEmpty={!draft.body.trim()}
          closeEmpty={!draft.close.trim()}
          onApply={(next) => {
            if (next.hook && !draft.hook.trim()) setField("hook", next.hook);
            if (next.body && !draft.body.trim()) setField("body", next.body);
            if (next.close && !draft.close.trim()) setField("close", next.close);
          }}
        />
      )}

      <ContentWritingSection
        hook={draft.hook}
        body={draft.body}
        close={draft.close}
        notes={draft.notes}
        backupLabel={backupLabel}
        recoveredDraftAt={recoveredDraftAt}
        onHookChange={(value) => setField("hook", value)}
        onBodyChange={(value) => setField("body", value)}
        onCloseChange={(value) => setField("close", value)}
        onNotesChange={(value) => setField("notes", value)}
        onDiscardRecoveredDraft={discardRecoveredDraft}
      />
    </form>
  );
}
