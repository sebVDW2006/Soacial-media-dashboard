import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is required.");
}

const client = createClient({ url, authToken });

const pillars = [
  ["startup-journey", "Startup Journey", "Lessons from building uBlend"],
  ["b2b-experience", "B2B Experience", "Selling to gyms, offices, venues, events"],
  ["healthy-eating", "Healthy Eating Education", "Transparency, real fruit, nutrition"],
  ["discipline-lifestyle", "Discipline & Lifestyle", "Training, routine, founder energy"],
  ["faith-integrity", "Faith & Integrity", "Principles, reflection, deeper meaning"],
];

const formats = [
  [1, "founder-lesson", "Founder Lesson", "Seb LinkedIn, Seb Instagram, YouTube Shorts", "Startup Journey", "Something I learned this week building uBlend…", "One clear lesson from suppliers, sales, product, venues, customers, pricing, or operations.", "Lesson: building a real business forces you to face the truth quickly.", JSON.stringify(["What a Chinese supplier dispute taught me about product control.", "The mistake I made when assuming a machine was 'self-cleaning'.", "Why a product business is 10x harder than an online business.", "The biggest lesson from pitching gyms and venues."]), 30],
  [2, "raw-build-update", "Raw Build Update", "Instagram Stories, Reels, LinkedIn", "Startup Journey", "Quick uBlend update…", "What happened. What it means. Next step.", "", JSON.stringify(["Quick uBlend update — we're testing the blade cleaning issue today.", "Quick uBlend update — I'm speaking to another venue this week.", "Quick uBlend update — refining website visuals to make the product feel more premium."]), 15],
  [3, "problem-proof-lesson", "Problem → Proof → Lesson", "LinkedIn", "Startup Journey", "Problem: [the issue you found]", "Proof: [why it matters in your operating context]\nLesson: [the principle this teaches]", "This is why we are testing every claim before scaling.", JSON.stringify(["We found fruit residue around the blade shaft after cleaning. Hygiene is not optional in a commercial environment. Self-service food tech only works if operations are simple, safe, and repeatable."]), 20],
  [4, "ublend-experience-demo", "uBlend Experience Demo", "uBlend Instagram, website, sales content", "B2B Experience", "POV: Your office has a self-service smoothie station.", "Shot 1: Customer picks cup. Shot 2: Cup goes into machine. Shot 3: Button/payment moment. Shot 4: Blending close-up. Shot 5: Finished smoothie.", "Real fruit. 60 seconds. Fully self-service.", JSON.stringify(["From frozen fruit to smoothie in under 60 seconds.", "No staff. No queue. Just real fruit blended on demand."]), 30],
  [5, "ingredient-truth", "Ingredient Truth Post", "uBlend Instagram, LinkedIn, Reels", "Healthy Eating Education", "Most smoothies hide what is inside. We do the opposite.", "Show raw fruit in the cup. Explain what is inside.", "Transparency is the product.", JSON.stringify(["95g strawberry. 45g banana. Nothing hidden.", "Why we use visible frozen fruit instead of mystery mixes.", "What 'no added sugar' actually means for uBlend.", "Why clear cups matter."]), 25],
  [6, "discipline-bridge", "Discipline Bridge", "Seb personal Instagram, YouTube Shorts", "Discipline & Lifestyle", "Discipline is easier when your environment supports it.", "Shot 1: 5am / gym / cycling / training. Shot 2: Make uBlend smoothie. Shot 3: Quick reflection.", "", JSON.stringify(["5am training, then real food. This is why I'm building uBlend.", "My morning routine: train, recover, build.", "Your body performs better when convenience doesn't mean compromise."]), 30],
  [7, "venue-case", "Venue Case Post", "uBlend LinkedIn", "B2B Experience", "Most venues think healthy food needs staff. It doesn't.", "Footfall. Dwell time. Customer experience. Healthy option. Low labour.", "uBlend is designed for gyms, offices, events and premium high-footfall spaces.", JSON.stringify(["Why gyms should rethink their post-workout nutrition offering.", "How a smoothie station creates a healthier customer experience without adding staff.", "Why dwell time matters at exhibitions."]), 20],
  [8, "founder-reflection", "Founder Reflection", "Seb personal LinkedIn / Instagram", "Faith & Integrity", "[Observation from this week]", "[Biblical / principle-based reflection] [Business or life application]", "[Question to audience]", JSON.stringify(["Building a company is exposing my impatience.", "Faith is not just what you say. It is how you make decisions when things go wrong.", "Discipline without purpose becomes pride.", "Why I believe business should reconnect people to what is real."]), 25],
];

const channels = [
  ["seb_linkedin", "Seb LinkedIn", "seb"],
  ["seb_instagram", "Seb Instagram", "seb"],
  ["ublend_linkedin", "uBlend LinkedIn", "ublend"],
  ["ublend_instagram", "uBlend Instagram", "ublend"],
  ["tiktok", "TikTok", "ublend"],
  ["youtube_shorts", "YouTube Shorts", "ublend"],
];

for (const [index, pillar] of pillars.entries()) {
  await client.execute({
    sql: "INSERT OR IGNORE INTO pillars (id, slug, name, description) VALUES (?, ?, ?, ?)",
    args: [index + 1, pillar[0], pillar[1], pillar[2]],
  });
}

for (const format of formats) {
  await client.execute({
    sql: `INSERT OR IGNORE INTO formats
      (id, slug, name, best_for, pillar_hint, hook_template, body_template, close_template, examples_json, est_minutes, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    args: format,
  });
}

for (const [index, channel] of channels.entries()) {
  await client.execute({
    sql: "INSERT OR IGNORE INTO channels (id, slug, name, brand, active) VALUES (?, ?, ?, ?, 1)",
    args: [index + 1, channel[0], channel[1], channel[2]],
  });
}

console.log("Reference data seeded.");
