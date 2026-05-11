export type Brand = "seb" | "ublend";

export type IdeaStatus = "idea" | "promoted" | "dropped";
export type ContentStatus =
  | "idea"
  | "drafting"
  | "captured"
  | "scheduled"
  | "posted"
  | "tracked";
export type ChannelStatus = "planned" | "scheduled" | "posted";
export type CaptureStatus = "planned" | "done";
export type AssetKind =
  | "founder_clip"
  | "product_clip"
  | "lifestyle_clip"
  | "proof_clip"
  | "photo"
  | "branding";

export type Pillar = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type Format = {
  id: number;
  slug: string;
  name: string;
  best_for: string | null;
  pillar_hint: string | null;
  hook_template: string | null;
  body_template: string | null;
  close_template: string | null;
  examples_json: string | null;
  est_minutes: number | null;
  active: number;
};

export type Channel = {
  id: number;
  slug: string;
  name: string;
  brand: Brand;
  active: number;
};

export type Idea = {
  id: number;
  title: string;
  raw_note: string | null;
  suggested_format_id: number | null;
  suggested_pillar_id: number | null;
  status: IdeaStatus;
  promoted_to_content_id: number | null;
  created_at: string;
};

export type PostType =
  | "single-image"
  | "carousel"
  | "reel"
  | "story"
  | "short-video"
  | "text-post"
  | "long-video"
  | "document";

export type ContentItem = {
  id: number;
  title: string;
  format_id: number;
  pillar_id: number;
  brand: Brand;
  post_type: PostType;
  hook: string | null;
  body: string | null;
  close: string | null;
  status: ContentStatus;
  target_post_at: string | null;
  week_iso: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentChannel = {
  id: number;
  content_item_id: number;
  channel_id: number;
  scheduled_at: string | null;
  posted_at: string | null;
  posted_url: string | null;
  status: ChannelStatus;
};

export type CaptureSession = {
  id: number;
  capture_date: string;
  status: CaptureStatus;
  notes: string | null;
  created_at: string;
};

export type Asset = {
  id: number;
  kind: AssetKind;
  title: string;
  url: string | null;
  capture_session_id: number | null;
  captured_on: string | null;
  notes: string | null;
  created_at: string;
};

export type WeeklyReview = {
  id: number;
  week_iso: string;
  what_worked: string | null;
  what_didnt: string | null;
  next_week_focus: string | null;
  top_content_id: number | null;
  created_at: string;
};

export type ContentListItem = ContentItem & {
  format_name: string;
  pillar_name: string;
  channel_names: string | null;
};

export type ContentChannelDetail = ContentChannel & {
  channel_name: string;
  channel_slug: string;
  brand: Brand;
};

export type AssetWithLinks = Asset & {
  linked_content_titles?: string | null;
};

