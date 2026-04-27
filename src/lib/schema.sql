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
  hook TEXT,
  body TEXT,
  close TEXT,
  status TEXT NOT NULL DEFAULT 'drafting'
    CHECK(status IN ('idea', 'drafting', 'captured', 'scheduled', 'posted', 'tracked')),
  target_post_at TEXT,
  week_iso TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
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

