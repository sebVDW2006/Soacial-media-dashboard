import type { Client } from "@libsql/client";

const pillars = [
  ["startup-journey", "Startup Journey", "Lessons from building uBlend"],
  ["b2b-experience", "B2B Experience", "Selling to gyms, offices, venues, events"],
  ["healthy-eating", "Healthy Eating Education", "Transparency, real fruit, nutrition"],
  ["discipline-lifestyle", "Discipline & Lifestyle", "Training, routine, founder energy"],
  ["faith-integrity", "Faith & Integrity", "Principles, reflection, deeper meaning"],
];

const formats = [
  {
    id: 1,
    slug: "founder-lesson",
    name: "Founder Lesson",
    bestFor: "Seb LinkedIn, Seb Instagram, YouTube Shorts",
    pillarHint: "Startup Journey",
    hook: "Something I learned this week building uBlend…",
    body: "One clear lesson from suppliers, sales, product, venues, customers, pricing, or operations.",
    close: "Lesson: building a real business forces you to face the truth quickly.",
    examples: [
      "What a Chinese supplier dispute taught me about product control.",
      "The mistake I made when assuming a machine was 'self-cleaning'.",
      "Why a product business is 10x harder than an online business.",
      "The biggest lesson from pitching gyms and venues.",
    ],
    estMinutes: 30,
  },
  {
    id: 2,
    slug: "raw-build-update",
    name: "Raw Build Update",
    bestFor: "Instagram Stories, Reels, LinkedIn",
    pillarHint: "Startup Journey",
    hook: "Quick uBlend update…",
    body: "What happened. What it means. Next step.",
    close: "",
    examples: [
      "Quick uBlend update — we're testing the blade cleaning issue today.",
      "Quick uBlend update — I'm speaking to another venue this week.",
      "Quick uBlend update — refining website visuals to make the product feel more premium.",
    ],
    estMinutes: 15,
  },
  {
    id: 3,
    slug: "problem-proof-lesson",
    name: "Problem → Proof → Lesson",
    bestFor: "LinkedIn",
    pillarHint: "Startup Journey",
    hook: "Problem: [the issue you found]",
    body: "Proof: [why it matters in your operating context]\nLesson: [the principle this teaches]",
    close: "This is why we are testing every claim before scaling.",
    examples: [
      "We found fruit residue around the blade shaft after cleaning. Hygiene is not optional in a commercial environment. Self-service food tech only works if operations are simple, safe, and repeatable.",
    ],
    estMinutes: 20,
  },
  {
    id: 4,
    slug: "ublend-experience-demo",
    name: "uBlend Experience Demo",
    bestFor: "uBlend Instagram, website, sales content",
    pillarHint: "B2B Experience",
    hook: "POV: Your office has a self-service smoothie station.",
    body: "Shot 1: Customer picks cup. Shot 2: Cup goes into machine. Shot 3: Button/payment moment. Shot 4: Blending close-up. Shot 5: Finished smoothie.",
    close: "Real fruit. 60 seconds. Fully self-service.",
    examples: [
      "From frozen fruit to smoothie in under 60 seconds.",
      "No staff. No queue. Just real fruit blended on demand.",
    ],
    estMinutes: 30,
  },
  {
    id: 5,
    slug: "ingredient-truth",
    name: "Ingredient Truth Post",
    bestFor: "uBlend Instagram, LinkedIn, Reels",
    pillarHint: "Healthy Eating Education",
    hook: "Most smoothies hide what is inside. We do the opposite.",
    body: "Show raw fruit in the cup. Explain what is inside.",
    close: "Transparency is the product.",
    examples: [
      "95g strawberry. 45g banana. Nothing hidden.",
      "Why we use visible frozen fruit instead of mystery mixes.",
      "What 'no added sugar' actually means for uBlend.",
      "Why clear cups matter.",
    ],
    estMinutes: 25,
  },
  {
    id: 6,
    slug: "discipline-bridge",
    name: "Discipline Bridge",
    bestFor: "Seb personal Instagram, YouTube Shorts",
    pillarHint: "Discipline & Lifestyle",
    hook: "Discipline is easier when your environment supports it.",
    body: "Shot 1: 5am / gym / cycling / training. Shot 2: Make uBlend smoothie. Shot 3: Quick reflection.",
    close: "",
    examples: [
      "5am training, then real food. This is why I'm building uBlend.",
      "My morning routine: train, recover, build.",
      "Your body performs better when convenience doesn't mean compromise.",
    ],
    estMinutes: 30,
  },
  {
    id: 7,
    slug: "venue-case",
    name: "Venue Case Post",
    bestFor: "uBlend LinkedIn",
    pillarHint: "B2B Experience",
    hook: "Most venues think healthy food needs staff. It doesn't.",
    body: "Footfall. Dwell time. Customer experience. Healthy option. Low labour.",
    close: "uBlend is designed for gyms, offices, events and premium high-footfall spaces.",
    examples: [
      "Why gyms should rethink their post-workout nutrition offering.",
      "How a smoothie station creates a healthier customer experience without adding staff.",
      "Why dwell time matters at exhibitions.",
    ],
    estMinutes: 20,
  },
  {
    id: 8,
    slug: "founder-reflection",
    name: "Founder Reflection",
    bestFor: "Seb personal LinkedIn / Instagram",
    pillarHint: "Faith & Integrity",
    hook: "[Observation from this week]",
    body: "[Biblical / principle-based reflection] [Business or life application]",
    close: "[Question to audience]",
    examples: [
      "Building a company is exposing my impatience.",
      "Faith is not just what you say. It is how you make decisions when things go wrong.",
      "Discipline without purpose becomes pride.",
      "Why I believe business should reconnect people to what is real.",
    ],
    estMinutes: 25,
  },
];

const channels = [
  ["seb_linkedin", "Seb LinkedIn", "seb"],
  ["seb_instagram", "Seb Instagram", "seb"],
  ["ublend_linkedin", "uBlend LinkedIn", "ublend"],
  ["ublend_instagram", "uBlend Instagram", "ublend"],
  ["tiktok", "TikTok", "ublend"],
  ["youtube_shorts", "YouTube Shorts", "ublend"],
];

export async function seedReferenceData(db: Client) {
  for (const [index, pillar] of pillars.entries()) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO pillars (id, slug, name, description)
        VALUES (?, ?, ?, ?)`,
      args: [index + 1, pillar[0], pillar[1], pillar[2]],
    });
  }

  for (const format of formats) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO formats
        (id, slug, name, best_for, pillar_hint, hook_template, body_template, close_template, examples_json, est_minutes, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [
        format.id,
        format.slug,
        format.name,
        format.bestFor,
        format.pillarHint,
        format.hook,
        format.body,
        format.close,
        JSON.stringify(format.examples),
        format.estMinutes,
      ],
    });
  }

  for (const [index, channel] of channels.entries()) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO channels (id, slug, name, brand, active)
        VALUES (?, ?, ?, ?, 1)`,
      args: [index + 1, channel[0], channel[1], channel[2]],
    });
  }
}

