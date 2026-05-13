CREATE TABLE IF NOT EXISTS pillars (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS formats (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  best_for TEXT,
  pillar_hint TEXT,
  hook_template TEXT,
  body_template TEXT,
  close_template TEXT,
  examples_json TEXT,
  est_minutes INTEGER,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  raw_note TEXT,
  suggested_format_id INTEGER REFERENCES formats(id),
  suggested_pillar_id INTEGER REFERENCES pillars(id),
  status TEXT NOT NULL DEFAULT 'idea'
    CHECK(status IN ('idea', 'promoted', 'dropped')),
  promoted_to_content_id INTEGER REFERENCES content_items(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  format_id INTEGER NOT NULL REFERENCES formats(id),
  pillar_id INTEGER NOT NULL REFERENCES pillars(id),
  brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
  content_type TEXT,
  sub_pillar TEXT,
  storytelling_structure TEXT,
  post_type TEXT NOT NULL DEFAULT 'linkedin-text-post',
  hook TEXT,
  body TEXT,
  close TEXT,
  status TEXT NOT NULL DEFAULT 'drafting',
  target_post_at TEXT,
  week_iso TEXT,
  notes TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  performance_metrics TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  posted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_content_week ON content_items(week_iso);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);

CREATE TABLE IF NOT EXISTS content_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  channel_id INTEGER NOT NULL REFERENCES channels(id),
  scheduled_at TEXT,
  posted_at TEXT,
  posted_url TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK(status IN ('planned', 'scheduled', 'posted')),
  UNIQUE(content_item_id, channel_id)
);

CREATE TABLE IF NOT EXISTS social_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
  platform TEXT NOT NULL CHECK(platform IN ('instagram', 'linkedin')),
  account_type TEXT NOT NULL CHECK(account_type IN
    ('instagram_business', 'instagram_creator', 'linkedin_page', 'linkedin_member')),
  display_name TEXT NOT NULL,
  handle TEXT,
  external_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TEXT,
  connection_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK(connection_status IN ('connected', 'expired', 'needs_review', 'manual_only')),
  last_synced_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(brand, platform, account_type)
);
CREATE INDEX IF NOT EXISTS idx_social_accounts_brand_platform ON social_accounts(brand, platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_status ON social_accounts(connection_status);

CREATE TABLE IF NOT EXISTS post_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES content_channels(id) ON DELETE CASCADE,
  social_account_id INTEGER REFERENCES social_accounts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK(platform IN ('instagram', 'linkedin')),
  brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
  post_url TEXT NOT NULL,
  external_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'not_connected'
    CHECK(status IN ('not_connected', 'connected', 'syncing', 'synced', 'failed', 'manual')),
  last_synced_at TEXT,
  error_message TEXT,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  follower_growth_from_post INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(post_id)
);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_account ON post_analytics(social_account_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_status ON post_analytics(status);

CREATE TABLE IF NOT EXISTS capture_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_date TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'done')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK(kind IN
    ('founder_clip', 'product_clip', 'lifestyle_clip', 'proof_clip', 'photo', 'branding')),
  title TEXT NOT NULL,
  url TEXT,
  capture_session_id INTEGER REFERENCES capture_sessions(id) ON DELETE SET NULL,
  captured_on TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_assets_session ON assets(capture_session_id);
CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(kind);

CREATE TABLE IF NOT EXISTS content_assets (
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  PRIMARY KEY (content_item_id, asset_id)
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_channel_id INTEGER NOT NULL REFERENCES content_channels(id) ON DELETE CASCADE,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  follows INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  dms_or_leads INTEGER DEFAULT 0,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_kpi_channel ON kpi_snapshots(content_channel_id);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_iso TEXT NOT NULL UNIQUE,
  what_worked TEXT,
  what_didnt TEXT,
  next_week_focus TEXT,
  top_content_id INTEGER REFERENCES content_items(id),
  created_at TEXT DEFAULT (datetime('now'))
);
