# Content OS — Developer Handoff

A central content management system for Seb (founder of uBlend) covering both
his **personal brand** and the **uBlend** brand. Captures ideas, drafts posts
in 8 repeatable formats, plans the weekly Tuesday capture day, manages a
shared asset library, schedules posts across 6 channels, and tracks KPIs.

This document is the complete spec. Build to it.

## Build it the most efficient way — read this first

These directives override anything else in this doc that conflicts. The goal
is **shipping a working v1 in days, not weeks**. Do not over-engineer.

1. **Server Actions over API routes for all mutations.** Forms post directly
   to actions colocated with the page. Only use `route.ts` files for: (a) the
   login endpoint, (b) endpoints called by external requests, and (c) GET
   endpoints that need URL params (e.g. `/api/kpis/summary?groupBy=`). Most
   reads happen directly in Server Components — no fetch layer.
2. **No client state library.** No Zustand / Redux / Jotai. Use URL search
   params for filters, React state for forms.
3. **One `ContentForm` component used by both `new` and `[id]` pages.** Don't
   duplicate. The Server Action it submits to handles upsert (insert if no id,
   update otherwise).
4. **No tests on v1.** Manual verification only. Add tests post-launch if
   a regression bites.
5. **No auth library.** Hand-rolled HMAC cookie in ~30 lines. No JWT, no
   NextAuth, no Lucia.
6. **No charts library.** Plain Tailwind divs with `width: %` for bars.
7. **No image upload, no thumbnail generation.** `<img src={asset.url}>`
   straight from Drive/iCloud public links.
8. **Schema is idempotent and re-run on every boot** (`getDb()` runs
   `schema.sql`). No migration tooling — schema changes = edit the file.
9. **Don't build per-resource API CRUD scaffolds for reference data.**
   `pillars`, `channels`, `formats` are read directly in Server Components
   from `getDb()`. The only mutation on formats is editing templates → one
   Server Action, not a route.
10. **Ship vertical slices, not horizontal layers.** Step 3 (Inbox) must be
    fully working before starting step 4. Each slice = schema + page + action
    + working in browser. Do not build "all the schemas" then "all the pages"
    then "all the actions".
11. **No optimistic UI.** Mutations reload the page or call `revalidatePath`.
    Add optimism later if it bothers the user.
12. **Co-locate.** `/inbox/page.tsx` + `/inbox/actions.ts` + form component
    for that page sit next to each other.
13. **Skip what's listed under "Out of scope".** If tempted, stop and ask.

If anything in this doc adds files or complexity not justified by these
rules, simplify or skip it.

## Tech stack (non-negotiable)

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (no component library — keep markup simple, mobile-first)
- **Turso** via `@libsql/client` (cloud SQLite — same stack as the user's
  `ublend-stock` project)
- **Vercel** for deploy
- No charts library — use plain HTML/CSS bars in the KPI dashboard

This matches the user's existing `ublend-stock` conventions exactly. Do not
swap libraries without asking.

## First-run setup

```bash
npm install
cp .env.example .env.local      # fill in TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, CONTENT_OS_PASSWORD
npm run db:init                  # creates schema in Turso DB
npm run db:seed                  # seeds pillars, formats, channels
npm run dev                      # serves on 0.0.0.0:3000 (works from phone over LAN)
```

## What this app does

The user produces content for two brands across six channels on a weekly
cadence. The system codifies that workflow:

**Weekly flow:**
- **Mon** — Plan + write (post Seb LinkedIn Founder Lesson)
- **Tue** — Capture day: film founder clip, product sequence, lifestyle, proof clip, photos. Post uBlend IG Product Proof.
- **Wed** — Edit + draft. Post Seb IG Discipline/Reflection.
- **Thu** — Post uBlend LinkedIn Venue Case
- **Fri** — Optional Reel/TikTok/Short
- **Sat** — Stories only
- **Sun** — Review week, plan next

**The 8 formats** (each has a hook/body/close template — seeded into the DB):
1. Founder Lesson — Seb LI / IG, YT Shorts
2. Raw Build Update — IG Stories, Reels, LI
3. Problem → Proof → Lesson — LinkedIn
4. uBlend Experience Demo — uBlend IG, sales content
5. Ingredient Truth Post — uBlend IG, LI
6. Discipline Bridge — Seb IG, YT Shorts
7. Venue Case Post — uBlend LI
8. Founder Reflection — Seb LI, IG

**The 5 pillars:**
1. Startup Journey
2. B2B Experience
3. Healthy Eating Education
4. Discipline & Lifestyle
5. Faith & Integrity

**The 6 channels** (each tagged with `brand`):
| Channel              | Brand   |
|----------------------|---------|
| seb_linkedin         | seb     |
| seb_instagram        | seb     |
| ublend_linkedin      | ublend  |
| ublend_instagram     | ublend  |
| tiktok               | ublend  |
| youtube_shorts       | ublend  |

## Architecture

```
src/
├── middleware.ts                   auth cookie gate (top-level, not under app/)
├── app/
│   ├── layout.tsx                  root layout, Nav, fonts/metadata
│   ├── page.tsx                    Dashboard (Server Component, reads DB)
│   ├── globals.css
│   ├── actions.ts                  shared Server Actions used across pages
│   ├── login/
│   │   ├── page.tsx                password input
│   │   └── actions.ts              login action (sets cookie)
│   ├── inbox/
│   │   ├── page.tsx                Server Component lists ideas + sticky quick-add
│   │   └── actions.ts              createIdea, promoteIdea, deleteIdea
│   ├── calendar/page.tsx           reads scheduled content_channels for week
│   ├── pipeline/
│   │   ├── page.tsx                kanban
│   │   └── actions.ts              moveStatus action (used by drag/click)
│   ├── content/
│   │   ├── new/page.tsx            renders <ContentForm /> with no defaults
│   │   ├── [id]/page.tsx           renders <ContentForm /> + per-channel scheduling
│   │   └── actions.ts              upsertContent, attachChannels, schedule, markPosted, addKpi
│   ├── capture/
│   │   ├── page.tsx                lazy-creates current Tuesday session
│   │   ├── [id]/page.tsx           specific session
│   │   └── actions.ts              addAsset, completeSession
│   ├── assets/
│   │   ├── page.tsx                library grid
│   │   └── actions.ts              upsertAsset, deleteAsset
│   ├── formats/
│   │   ├── page.tsx                edit 8 templates
│   │   └── actions.ts              updateFormat
│   ├── kpis/page.tsx               summary dashboard (reads DB directly)
│   ├── reviews/
│   │   ├── page.tsx                list
│   │   ├── [week]/page.tsx         one review
│   │   └── actions.ts              upsertReview
│   ├── settings/page.tsx           read-only info
│   └── api/
│       ├── auth/login/route.ts     external POST (form posts here, not action, so cookie set works cleanly)
│       └── kpis/summary/route.ts   GET ?groupBy=&range= for client-side filters on /kpis
├── components/
│   ├── Nav.tsx
│   ├── WeeklyCalendar.tsx
│   ├── Kanban.tsx
│   ├── ContentForm.tsx             ⭐ shared by new + [id]
│   ├── ChannelMultiSelect.tsx
│   ├── AssetPicker.tsx
│   ├── CaptureChecklist.tsx
│   ├── KPIBars.tsx                 plain HTML/CSS
│   ├── IdeaQuickAdd.tsx            client component, calls action
│   ├── WeekPicker.tsx
│   └── StatusPill.tsx
├── lib/
│   ├── db.ts                       getDb() runs schema.sql on first call
│   ├── schema.sql                  all CREATE TABLE; idempotent
│   ├── seed.ts                     seed pillars, formats, channels (idempotent)
│   ├── types.ts                    all TS types
│   ├── auth.ts                     ~30 lines: hashPassword, signCookie, verifyCookie
│   ├── week.ts                     getISOWeek, weekRange
│   ├── queries.ts                  all read queries used by Server Components
│   └── kpi.ts                      summary aggregations
└── scripts/
    ├── init-db.mjs                 runs schema.sql against Turso
    └── seed.mjs                    runs lib/seed.ts
```

**Why this layout:**
- ~13 `actions.ts` files instead of ~25 `route.ts` files — about half the boilerplate.
- One `ContentForm` instead of two near-identical pages — DRY where it matters.
- All read queries live in `lib/queries.ts` — Server Components import directly.
- No `/api/*` for resources users CRUD via the UI; only the things that need it.

## Database model (source of truth: `src/lib/schema.sql`)

### Reference tables (seeded; never edited by user except formats)

```sql
CREATE TABLE pillars (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,             -- 'startup-journey', etc.
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE formats (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,             -- 'founder-lesson', etc.
  name TEXT NOT NULL,
  best_for TEXT,                         -- 'Seb LinkedIn, Seb Instagram, YouTube Shorts'
  pillar_hint TEXT,                      -- e.g. 'Startup Journey'
  hook_template TEXT,
  body_template TEXT,
  close_template TEXT,
  examples_json TEXT,                    -- JSON array of example titles
  est_minutes INTEGER,                   -- effort estimate
  active INTEGER DEFAULT 1
);

CREATE TABLE channels (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,             -- 'seb_linkedin', etc.
  name TEXT NOT NULL,                    -- 'Seb LinkedIn'
  brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
  active INTEGER DEFAULT 1
);
```

### Working tables

```sql
CREATE TABLE ideas (
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

CREATE TABLE content_items (
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
  target_post_at TEXT,                   -- ISO datetime, the planned post moment
  week_iso TEXT,                         -- '2026-W18' (auto-computed from target_post_at)
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_content_week ON content_items(week_iso);
CREATE INDEX idx_content_status ON content_items(status);

CREATE TABLE content_channels (
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

CREATE TABLE capture_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_date TEXT NOT NULL UNIQUE,     -- 'YYYY-MM-DD'
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'done')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK(kind IN
    ('founder_clip', 'product_clip', 'lifestyle_clip', 'proof_clip', 'photo', 'branding')),
  title TEXT NOT NULL,
  url TEXT,                              -- Drive/iCloud link
  capture_session_id INTEGER REFERENCES capture_sessions(id) ON DELETE SET NULL,
  captured_on TEXT,                      -- 'YYYY-MM-DD'
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_assets_session ON assets(capture_session_id);
CREATE INDEX idx_assets_kind ON assets(kind);

CREATE TABLE content_assets (
  content_item_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  PRIMARY KEY (content_item_id, asset_id)
);

CREATE TABLE kpi_snapshots (
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
CREATE INDEX idx_kpi_channel ON kpi_snapshots(content_channel_id);

CREATE TABLE weekly_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_iso TEXT NOT NULL UNIQUE,         -- '2026-W18'
  what_worked TEXT,
  what_didnt TEXT,
  next_week_focus TEXT,
  top_content_id INTEGER REFERENCES content_items(id),
  created_at TEXT DEFAULT (datetime('now'))
);
```

## Seed data (`src/lib/seed.ts`)

The seed script must be **idempotent** (use `INSERT OR IGNORE` keyed on slug).

### Pillars (5)

```
startup-journey      | Startup Journey            | Lessons from building uBlend
b2b-experience       | B2B Experience             | Selling to gyms, offices, venues, events
healthy-eating       | Healthy Eating Education   | Transparency, real fruit, nutrition
discipline-lifestyle | Discipline & Lifestyle     | Training, routine, founder energy
faith-integrity      | Faith & Integrity          | Principles, reflection, deeper meaning
```

### Formats (8) — seed verbatim from this section

```
1. founder-lesson — Founder Lesson
   best_for: Seb LinkedIn, Seb Instagram, YouTube Shorts
   pillar_hint: Startup Journey
   hook_template: "Something I learned this week building uBlend…"
   body_template: "One clear lesson from suppliers, sales, product, venues, customers, pricing, or operations."
   close_template: "Lesson: building a real business forces you to face the truth quickly."
   examples: ["What a Chinese supplier dispute taught me about product control.",
              "The mistake I made when assuming a machine was 'self-cleaning'.",
              "Why a product business is 10x harder than an online business.",
              "The biggest lesson from pitching gyms and venues."]
   est_minutes: 30

2. raw-build-update — Raw Build Update
   best_for: Instagram Stories, Reels, LinkedIn
   pillar_hint: Startup Journey
   hook_template: "Quick uBlend update…"
   body_template: "What happened. What it means. Next step."
   close_template: ""
   examples: ["Quick uBlend update — we're testing the blade cleaning issue today.",
              "Quick uBlend update — I'm speaking to another venue this week.",
              "Quick uBlend update — refining website visuals to make the product feel more premium."]
   est_minutes: 15

3. problem-proof-lesson — Problem → Proof → Lesson
   best_for: LinkedIn
   pillar_hint: Startup Journey
   hook_template: "Problem: [the issue you found]"
   body_template: "Proof: [why it matters in your operating context]\nLesson: [the principle this teaches]"
   close_template: "This is why we are testing every claim before scaling."
   examples: ["We found fruit residue around the blade shaft after cleaning. Hygiene is not optional in a commercial environment. Self-service food tech only works if operations are simple, safe, and repeatable."]
   est_minutes: 20

4. ublend-experience-demo — uBlend Experience Demo
   best_for: uBlend Instagram, website, sales content
   pillar_hint: B2B Experience
   hook_template: "POV: Your office has a self-service smoothie station."
   body_template: "Shot 1: Customer picks cup. Shot 2: Cup goes into machine. Shot 3: Button/payment moment. Shot 4: Blending close-up. Shot 5: Finished smoothie."
   close_template: "Real fruit. 60 seconds. Fully self-service."
   examples: ["From frozen fruit to smoothie in under 60 seconds.",
              "No staff. No queue. Just real fruit blended on demand."]
   est_minutes: 30

5. ingredient-truth — Ingredient Truth Post
   best_for: uBlend Instagram, LinkedIn, Reels
   pillar_hint: Healthy Eating Education
   hook_template: "Most smoothies hide what is inside. We do the opposite."
   body_template: "Show raw fruit in the cup. Explain what is inside."
   close_template: "Transparency is the product."
   examples: ["95g strawberry. 45g banana. Nothing hidden.",
              "Why we use visible frozen fruit instead of mystery mixes.",
              "What 'no added sugar' actually means for uBlend.",
              "Why clear cups matter."]
   est_minutes: 25

6. discipline-bridge — Discipline Bridge
   best_for: Seb personal Instagram, YouTube Shorts
   pillar_hint: Discipline & Lifestyle
   hook_template: "Discipline is easier when your environment supports it."
   body_template: "Shot 1: 5am / gym / cycling / training. Shot 2: Make uBlend smoothie. Shot 3: Quick reflection."
   close_template: ""
   examples: ["5am training, then real food. This is why I'm building uBlend.",
              "My morning routine: train, recover, build.",
              "Your body performs better when convenience doesn't mean compromise."]
   est_minutes: 30

7. venue-case — Venue Case Post
   best_for: uBlend LinkedIn
   pillar_hint: B2B Experience
   hook_template: "Most venues think healthy food needs staff. It doesn't."
   body_template: "Footfall. Dwell time. Customer experience. Healthy option. Low labour."
   close_template: "uBlend is designed for gyms, offices, events and premium high-footfall spaces."
   examples: ["Why gyms should rethink their post-workout nutrition offering.",
              "How a smoothie station creates a healthier customer experience without adding staff.",
              "Why dwell time matters at exhibitions."]
   est_minutes: 20

8. founder-reflection — Founder Reflection
   best_for: Seb personal LinkedIn / Instagram
   pillar_hint: Faith & Integrity
   hook_template: "[Observation from this week]"
   body_template: "[Biblical / principle-based reflection] [Business or life application]"
   close_template: "[Question to audience]"
   examples: ["Building a company is exposing my impatience.",
              "Faith is not just what you say. It is how you make decisions when things go wrong.",
              "Discipline without purpose becomes pride.",
              "Why I believe business should reconnect people to what is real."]
   est_minutes: 25
```

### Channels (6)

```
seb_linkedin     | Seb LinkedIn      | seb
seb_instagram    | Seb Instagram     | seb
ublend_linkedin  | uBlend LinkedIn   | ublend
ublend_instagram | uBlend Instagram  | ublend
tiktok           | TikTok            | ublend
youtube_shorts   | YouTube Shorts    | ublend
```

## Page specs

### `/` — Dashboard

Top of page: **This Week** — current ISO week, days until next post, day-of-week label.

Three columns (stack on mobile):
1. **Up next** — list of next 5 scheduled `content_channels` rows, ordered by `scheduled_at`.
2. **Idea inbox count** — `count(ideas WHERE status='idea')`. Click → `/inbox`.
3. **Capture day status** — current week's `capture_sessions` row. If missing, "Plan Tuesday" CTA → `/capture`.

Bottom: **KPI snapshot** — last 4 weeks. Bars by format and pillar (top 5 each).

### `/inbox` — Idea inbox

- Sticky `IdeaQuickAdd` at top: single-line title, optional dropdown for suggested format.
- List below: `ideas WHERE status='idea'`, newest first.
- Each row: title, suggested format pill, "Promote" button → `POST /api/ideas/[id]/promote` → redirect to `/content/[newId]`.
- Filter chips: All / Seb / uBlend (filters by suggested format's typical brand — best-effort).

### `/calendar` — Weekly calendar

- `WeekPicker` at top (default: current ISO week).
- 7 columns Mon-Sun, 2 rows (Seb / uBlend).
- Each cell shows scheduled `content_channels` rows for that day + brand.
- Click empty cell → `/content/new?date=YYYY-MM-DD&brand=seb`.
- Click filled card → `/content/[id]`.

### `/pipeline` — Kanban

- 6 columns: Idea / Drafting / Captured / Scheduled / Posted / Tracked.
- Cards = `content_items`, ordered by `target_post_at` ASC.
- Click → `/content/[id]`.
- Filter: brand toggle.

### `/content/new` and `/content/[id]` — Content editor ⭐ load-bearing

- Title input.
- **Format select** (8 options) — on change, populate hook/body/close from format templates **only if those fields are empty** (don't clobber edits).
- Pillar select (5 options).
- Brand radio (seb/ublend).
- **ChannelMultiSelect** — checkboxes for the 6 channels. Defaults: format's typical channels (e.g. founder-lesson → seb_linkedin + seb_instagram).
- **Hook / Body / Close** — three textareas.
- **target_post_at** — datetime input.
- **AssetPicker** — search assets by kind, click to attach. Shows linked assets.
- **Notes**.
- Save button.
- Below the form, **Per-channel scheduling block**: for each linked channel, show `scheduled_at`, `posted_at`, `posted_url` inputs. "Mark posted" button per channel.

### `/capture` — This week's capture day

- Lazy-create the `capture_sessions` row for current week's Tuesday on first visit.
- Show date, status, notes.
- **CaptureChecklist** — 5 sections, each with an "Add asset" button:
  1. Founder clip (target: 1 clip, 2-3 min)
  2. Product sequence (target: 5 shots — fruit in cup, cup into machine, blending, finished smoothie, branding)
  3. Lifestyle sequence (target: 5+ clips — gym, cycling, morning, laptop, nature, smoothie after training)
  4. Proof / problem clip (target: 1 — machine testing, cleaning, supplier msg, etc.)
  5. Photos (target: 5 — you, raw ingredients, product/cup, machine/freezer, lifestyle)
- Each section: progress vs target, list of assets added.
- "Mark session done" button.

### `/capture/[id]`

Same as `/capture` but for a specific past session.

### `/assets` — Library

- Filter chips: kind, capture session, brand-relevance (best-effort by linked content).
- Grid of cards: thumbnail (use `<img>` if URL is image; otherwise icon), title, kind, captured_on.
- Click → modal with full details, edit url/notes, list of linked content items.

### `/formats`

List of 8 formats. Click → edit hook/body/close/examples. Saves to formats table via `PATCH /api/formats/[id]`.

### `/kpis` — Dashboard

- Date range picker (default: last 30 days).
- **GroupBy toggle**: format / pillar / channel / brand.
- For chosen groupBy, render `KPIBars` for: impressions, engagement rate (likes+comments+shares / impressions), follows, dms_or_leads.
- Below: **Top 10 posts** by total engagement. Click → content.
- Aggregations defined in `src/lib/kpi.ts`. For multiple snapshots on the same `content_channel`, take the **most recent** per channel before aggregating.

### `/reviews` and `/reviews/[week]`

- List of weeks, newest first.
- Editor: what_worked, what_didnt, next_week_focus, top_content_id (autocomplete from posts in that week).
- Sunday CTA from dashboard if current week's review missing.

### `/settings`

Read-only list of channels (with brand). Note about password reset (env var). Display TURSO DB URL host (not the full token).

### `/login`

Single password input. POST to `/api/auth/login` → sets `content_os_session` cookie (httpOnly, Secure, SameSite=Lax, 30d). Redirects to `/`.

## Business rules

- **`week_iso` auto-compute**: whenever `target_post_at` changes, recalculate using ISO 8601 (YYYY-Www). Use a single helper in `src/lib/week.ts`.
- **Status auto-advance** (in API handlers, not a trigger):
  - When `target_post_at` is set and at least one `content_channels.scheduled_at` is set → `content_items.status = 'scheduled'`.
  - When any `content_channels.posted_url` is set → `status = 'posted'`.
  - When any `kpi_snapshots` row exists for a posted channel → `status = 'tracked'`.
- **Format auto-fill**: only fills empty hook/body/close fields. Never overwrites user input.
- **Brand inference**: when creating from a channel context, default brand to that channel's brand.
- **Lazy capture session**: `GET /api/capture-sessions?current=true` returns or creates the row for the current ISO week's Tuesday.
- **Idea promotion**: `POST /api/ideas/[id]/promote` creates a `content_items` row (status=`drafting`, copies title, suggested_format, suggested_pillar), updates idea to `status=promoted`, returns new content id.
- **Multi-channel posting**: one `content_items` row links to N `content_channels` rows. Each tracks its own `scheduled_at`, `posted_at`, `posted_url`. KPIs are per `content_channel`, not per `content_item`. A Reel published to IG, TikTok, and YT Shorts = 3 `content_channels` + 3 KPI streams.

## Auth (single-user, simple)

- Env var `CONTENT_OS_PASSWORD`.
- `/login` POSTs the password to `/api/auth/login` which compares against env and, on match, sets `content_os_session` cookie containing a signed timestamp (HMAC with `CONTENT_OS_SESSION_SECRET`).
- `src/middleware.ts` checks the cookie on every route except `/login` and `/api/auth/login`. No cookie → 302 to `/login`.
- 30-day cookie expiry, httpOnly, Secure (in prod), SameSite=Lax.

## Conventions

- All quantities are integers. Dates/times are ISO strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`).
- The few API routes that exist return JSON. On error: `{ error: "..." }` with 4xx/5xx. Server Actions return either the result object or throw — let Next.js render the error boundary.
- Tailwind only. Mobile-first — primary user is on a phone Tuesday capture day.
- No client-side state library. Server Components by default. Use Client Components only for forms, drag interactions, and the brand toggle.
- `getDb()` runs `schema.sql` on every boot — adding a new table = edit schema.sql, restart `next dev`.
- All mutations = Server Actions. The only `route.ts` files are `auth/login` and `kpis/summary` (see Efficiency directives, rule 1).
- No optimistic UI on first pass. Reload after mutation.

## Implementation order

Build top-down by user value. Don't move on until each step works end-to-end.

1. **Scaffold + DB** — package.json, tsconfig, tailwind, schema.sql, db.ts, types.ts, seed.ts, init script. Verify Turso connection (one row read/write).
2. **Auth + Nav + brand toggle** — login page, middleware, top nav, brand state in URL search param.
3. **Inbox** — ideas CRUD + sticky quick-add. User can start dumping ideas immediately.
4. **Content editor** — `/content/new`, `/content/[id]`, format auto-fill, channel multi-select, hook/body/close, save. ⭐ This is load-bearing — get it right.
5. **Calendar** — Mon-Sun grid with scheduled posts. Click cells.
6. **Pipeline** — kanban over the 6 statuses.
7. **Capture sessions + assets + checklist** — Tuesday flow.
8. **Asset linking** — `AssetPicker` on content editor; many-to-many.
9. **KPI entry + summary dashboard** — manual entry form on `/content/[id]` per channel; `/kpis` aggregations.
10. **Weekly reviews** — Sunday flow + dashboard CTA.
11. **Home dashboard** — assemble.
12. **Vercel deploy** — env vars, custom domain optional.

## Definition of done (v1)

- [ ] Capture an idea on phone in under 10 seconds
- [ ] Promote idea → content with format/pillar/channels in under 60 seconds
- [ ] See it on the weekly calendar in correct day + brand row
- [ ] Plan Tuesday capture, log assets across all 5 sequences
- [ ] Link a single asset to multiple content items
- [ ] Schedule a post per channel and mark posted with URL
- [ ] Log weekly KPIs across all posted channels in under 5 minutes
- [ ] Dashboard shows which formats / pillars / channels perform best last 30 days
- [ ] Weekly review captures what worked / didn't / next focus
- [ ] Single-password gate works on Vercel prod
- [ ] App is usable on phone (no horizontal scroll, tap targets ≥44px)

## Deployment

1. **Turso DB**:
   ```bash
   turso db create content-os
   turso db show --url content-os                    # → TURSO_DATABASE_URL
   turso db tokens create content-os                 # → TURSO_AUTH_TOKEN
   ```
2. **Push to GitHub**.
3. **Vercel**: import repo. Set env vars:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CONTENT_OS_PASSWORD`
   - `CONTENT_OS_SESSION_SECRET` (32+ random bytes)
4. **Init prod DB**: run `npm run db:init && npm run db:seed` locally with prod env vars in `.env.local`. (One-shot.)
5. Custom domain optional.

## Out of scope (v1) — do not build

- Auto KPI fetch from social APIs (LinkedIn, Meta, TikTok, YouTube)
- Direct posting to social platforms
- AI-generated drafts
- File uploads (URLs only — store Drive/iCloud links)
- Multi-user / accounts / roles
- Push notifications / email reminders
- Native mobile app
- Analytics charts beyond plain HTML/CSS bars
- Bulk import / export

If you find yourself wanting any of those, **stop and ask**.

## Questions to ask the user before starting

1. Do you want to seed any initial content/ideas, or start empty?
2. Brand of personal channels — should the system call you "Seb" anywhere user-facing, or stay generic?
3. Do you want an export-to-CSV button on KPIs? (Easy to add, not in scope by default.)
4. Domain you want for Vercel — `content.ublend.co.uk`, a personal one, or just `.vercel.app` for now?
