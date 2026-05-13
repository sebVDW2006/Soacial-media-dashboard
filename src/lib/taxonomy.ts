import type { Brand } from "@/lib/types";

export type ContentType = "educational" | "storytelling" | "authority";

export type SubPillar = {
  slug: string;
  name: string;
  brand: Brand;
};

export type PostFramework = {
  slug: string;
  name: string;
  question: string;
  recommendedBrands: Brand[];
  recommendedContentTypes: ContentType[];
  recommendedSubPillarSlugs: string[];
};

export type SmartTemplateSection = {
  label: string;
  prompt: string;
};

export type SmartTemplate = {
  hook: SmartTemplateSection;
  body: SmartTemplateSection;
  close: SmartTemplateSection;
  steps: Array<{ label: string; prompt: string }>;
};

export const CONTENT_TYPES: ReadonlyArray<{
  value: ContentType;
  label: string;
  short: string;
  description: string;
  badgeClass: string;
}> = [
  {
    value: "educational",
    label: "Educational",
    short: "Teach",
    description: "Teaches the audience something useful.",
    badgeClass: "bg-amber-100 text-amber-900",
  },
  {
    value: "storytelling",
    label: "Storytelling",
    short: "Connect",
    description: "Builds connection through personal or business journey.",
    badgeClass: "bg-stone-200 text-stone-800",
  },
  {
    value: "authority",
    label: "Authority / Proof",
    short: "Prove",
    description: "Builds trust through results, demos, traction, or case studies.",
    badgeClass: "bg-zinc-900 text-white",
  },
];

export const CONTENT_TYPE_HELPER =
  "Educational teaches. Storytelling connects. Authority / Proof builds trust.";

export const SUB_PILLAR_HELPER = "Choose the specific topic this post belongs to.";

export const POST_FRAMEWORK_HELPER =
  "Choose the repeatable structure this post will follow.";

export const SEB_SUB_PILLARS: SubPillar[] = [
  { slug: "founder-journey", name: "Founder Journey", brand: "seb" },
  { slug: "business-lessons", name: "Business Lessons", brand: "seb" },
  { slug: "leverage-systems", name: "Leverage & Systems", brand: "seb" },
  { slug: "raw-build-update", name: "Raw Build Update", brand: "seb" },
  { slug: "faith-integrity", name: "Faith & Integrity", brand: "seb" },
  { slug: "discipline-lifestyle", name: "Discipline & Lifestyle", brand: "seb" },
  { slug: "behind-the-scenes", name: "Behind the Scenes", brand: "seb" },
  { slug: "lessons-from-failure", name: "Lessons From Failure", brand: "seb" },
  { slug: "build-proof", name: "Build Proof", brand: "seb" },
  { slug: "personal-reflection", name: "Personal Reflection", brand: "seb" },
];

export const UBLEND_SUB_PILLARS: SubPillar[] = [
  { slug: "healthy-convenience", name: "Healthy Convenience", brand: "ublend" },
  { slug: "ingredient-transparency", name: "Ingredient Transparency", brand: "ublend" },
  { slug: "venue-revenue", name: "Venue Revenue", brand: "ublend" },
  { slug: "self-service-tech", name: "Self-Service Tech", brand: "ublend" },
  { slug: "machine-demo", name: "Machine Demo", brand: "ublend" },
  { slug: "product-proof", name: "Product Proof", brand: "ublend" },
  { slug: "behind-the-build", name: "Behind the Build", brand: "ublend" },
  { slug: "mission-vision", name: "Mission & Vision", brand: "ublend" },
  { slug: "customer-venue-case-study", name: "Customer / Venue Case Study", brand: "ublend" },
  { slug: "operational-efficiency", name: "Operational Efficiency", brand: "ublend" },
  { slug: "b2b-education", name: "B2B Education", brand: "ublend" },
  { slug: "recipe-product-development", name: "Recipe / Product Development", brand: "ublend" },
];

export const ALL_SUB_PILLARS: SubPillar[] = [...SEB_SUB_PILLARS, ...UBLEND_SUB_PILLARS];

const SUB_PILLAR_BY_SLUG = new Map(ALL_SUB_PILLARS.map((p) => [p.slug, p]));

export function getSubPillar(slug: string | null | undefined) {
  if (!slug) return null;
  return SUB_PILLAR_BY_SLUG.get(slug) ?? null;
}

export function getSubPillarLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return SUB_PILLAR_BY_SLUG.get(slug)?.name ?? slug;
}

export function getSubPillarsForBrand(brand: Brand | "all" | null | undefined) {
  if (brand === "seb") return SEB_SUB_PILLARS;
  if (brand === "ublend") return UBLEND_SUB_PILLARS;
  return ALL_SUB_PILLARS;
}

export const POST_FRAMEWORKS: PostFramework[] = [
  {
    slug: "founder-lesson",
    name: "Founder Lesson",
    question: "What did I learn this week?",
    recommendedBrands: ["seb"],
    recommendedContentTypes: ["educational", "storytelling"],
    recommendedSubPillarSlugs: ["business-lessons", "founder-journey", "leverage-systems"],
  },
  {
    slug: "raw-build-update",
    name: "Raw Build Update",
    question: "What changed this week?",
    recommendedBrands: ["seb", "ublend"],
    recommendedContentTypes: ["storytelling"],
    recommendedSubPillarSlugs: [
      "raw-build-update",
      "behind-the-build",
      "recipe-product-development",
    ],
  },
  {
    slug: "problem-proof-lesson",
    name: "Problem → Proof → Lesson",
    question: "What broke, what did we prove, what did it teach?",
    recommendedBrands: ["seb", "ublend"],
    recommendedContentTypes: ["authority"],
    recommendedSubPillarSlugs: [
      "build-proof",
      "product-proof",
      "venue-revenue",
      "operational-efficiency",
    ],
  },
  {
    slug: "ublend-experience-demo",
    name: "uBlend Experience Demo",
    question: "Can you understand it in 30 seconds?",
    recommendedBrands: ["ublend"],
    recommendedContentTypes: ["authority"],
    recommendedSubPillarSlugs: ["machine-demo", "product-proof", "self-service-tech"],
  },
  {
    slug: "ingredient-truth",
    name: "Ingredient Truth Post",
    question: "What's actually inside?",
    recommendedBrands: ["ublend"],
    recommendedContentTypes: ["educational"],
    recommendedSubPillarSlugs: ["ingredient-transparency", "healthy-convenience"],
  },
  {
    slug: "discipline-bridge",
    name: "Discipline Bridge",
    question: "How does discipline meet the build?",
    recommendedBrands: ["seb"],
    recommendedContentTypes: ["educational", "storytelling"],
    recommendedSubPillarSlugs: ["discipline-lifestyle", "founder-journey"],
  },
  {
    slug: "venue-case",
    name: "Venue Case Post",
    question: "Why should a venue care?",
    recommendedBrands: ["ublend"],
    recommendedContentTypes: ["authority"],
    recommendedSubPillarSlugs: [
      "venue-revenue",
      "customer-venue-case-study",
      "b2b-education",
    ],
  },
  {
    slug: "founder-reflection",
    name: "Founder Reflection",
    question: "What did this week reveal?",
    recommendedBrands: ["seb"],
    recommendedContentTypes: ["storytelling"],
    recommendedSubPillarSlugs: [
      "founder-journey",
      "personal-reflection",
      "lessons-from-failure",
    ],
  },
];

const FRAMEWORK_BY_SLUG = new Map(POST_FRAMEWORKS.map((f) => [f.slug, f]));

export function getPostFramework(slug: string | null | undefined) {
  if (!slug) return null;
  return FRAMEWORK_BY_SLUG.get(slug) ?? null;
}

export function rankPostFrameworks(
  brand: Brand | null | undefined,
  contentType: ContentType | null | undefined,
) {
  return [...POST_FRAMEWORKS].sort((left, right) => {
    const leftScore = scoreFramework(left, brand, contentType);
    const rightScore = scoreFramework(right, brand, contentType);
    if (leftScore !== rightScore) return rightScore - leftScore;
    return left.name.localeCompare(right.name);
  });
}

function scoreFramework(
  framework: PostFramework,
  brand: Brand | null | undefined,
  contentType: ContentType | null | undefined,
) {
  let score = 0;
  if (brand && framework.recommendedBrands.includes(brand)) score += 2;
  if (contentType && framework.recommendedContentTypes.includes(contentType)) score += 2;
  return score;
}

export type FormatOption = {
  value: string;
  label: string;
};

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: "linkedin-text-post", label: "LinkedIn Text Post" },
  { value: "carousel", label: "Carousel" },
  { value: "reel-short", label: "Reel / Short" },
  { value: "photo-post", label: "Photo Post" },
  { value: "document-post", label: "Document Post" },
  { value: "case-study-post", label: "Case Study Post" },
  { value: "thread", label: "Thread" },
  { value: "email-outreach", label: "Email / Outreach Repurpose" },
];

const FORMAT_BY_VALUE = new Map(FORMAT_OPTIONS.map((f) => [f.value, f]));

export function getFormatLabel(value: string | null | undefined) {
  if (!value) return null;
  const exact = FORMAT_BY_VALUE.get(value);
  if (exact) return exact.label;
  return LEGACY_POST_TYPE_LABELS[value] ?? value;
}

const LEGACY_POST_TYPE_LABELS: Record<string, string> = {
  "single-image": "Photo Post",
  carousel: "Carousel",
  reel: "Reel / Short",
  story: "Photo Post",
  "short-video": "Reel / Short",
  "text-post": "LinkedIn Text Post",
  "long-video": "Reel / Short",
  document: "Document Post",
};

export function normalizeLegacyFormat(value: string | null | undefined): string {
  if (!value) return "linkedin-text-post";
  if (FORMAT_BY_VALUE.has(value)) return value;
  switch (value) {
    case "single-image":
    case "story":
      return "photo-post";
    case "reel":
    case "short-video":
    case "long-video":
      return "reel-short";
    case "text-post":
      return "linkedin-text-post";
    case "document":
      return "document-post";
    default:
      return value;
  }
}

export const SMART_TEMPLATES: Record<ContentType, SmartTemplate> = {
  educational: {
    hook: {
      label: "Hook",
      prompt: "State the problem or insight.",
    },
    body: {
      label: "Body",
      prompt: "Teach the key idea. Then show how it applies with an example.",
    },
    close: {
      label: "Takeaway",
      prompt: "Give the audience a clear lesson.",
    },
    steps: [
      { label: "Hook", prompt: "State the problem or insight." },
      { label: "Value", prompt: "Teach the key idea." },
      { label: "Example", prompt: "Show how it applies." },
      { label: "Takeaway", prompt: "Give the audience a clear lesson." },
    ],
  },
  storytelling: {
    hook: {
      label: "Hook",
      prompt: "Start with the moment or tension.",
    },
    body: {
      label: "Body",
      prompt: "Explain what was happening, then share what it taught you.",
    },
    close: {
      label: "Reflection",
      prompt: "Connect it to the bigger journey.",
    },
    steps: [
      { label: "Hook", prompt: "Start with the moment or tension." },
      { label: "Context", prompt: "Explain what was happening." },
      { label: "Lesson", prompt: "Share what it taught you." },
      { label: "Reflection", prompt: "Connect it to the bigger journey." },
    ],
  },
  authority: {
    hook: {
      label: "Hook",
      prompt: "Show the proof, result, or demo.",
    },
    body: {
      label: "Body",
      prompt: "Why it matters. What happened, what was built, tested, improved, or achieved.",
    },
    close: {
      label: "Takeaway",
      prompt: "Why the audience should trust the brand/person more.",
    },
    steps: [
      { label: "Hook", prompt: "Show the proof/result/demo." },
      { label: "Context", prompt: "Why it matters." },
      { label: "Evidence", prompt: "What happened, what was built, tested, improved, or achieved." },
      { label: "Takeaway", prompt: "Why the audience should trust the brand/person more." },
    ],
  },
};

export const AUTO_SUGGEST_SUB_PILLARS: Record<
  Brand,
  Record<ContentType, readonly string[]>
> = {
  seb: {
    educational: [
      "business-lessons",
      "leverage-systems",
      "discipline-lifestyle",
      "faith-integrity",
    ],
    storytelling: [
      "founder-journey",
      "raw-build-update",
      "personal-reflection",
      "lessons-from-failure",
    ],
    authority: ["build-proof", "behind-the-scenes"],
  },
  ublend: {
    educational: [
      "healthy-convenience",
      "ingredient-transparency",
      "venue-revenue",
      "self-service-tech",
      "b2b-education",
      "operational-efficiency",
    ],
    storytelling: [
      "behind-the-build",
      "mission-vision",
      "recipe-product-development",
    ],
    authority: [
      "machine-demo",
      "product-proof",
      "customer-venue-case-study",
      "venue-revenue",
      "operational-efficiency",
    ],
  },
};

export function getSuggestedSubPillarSlugs(
  brand: Brand | null | undefined,
  contentType: ContentType | null | undefined,
): readonly string[] {
  if (!brand || !contentType) return [];
  return AUTO_SUGGEST_SUB_PILLARS[brand]?.[contentType] ?? [];
}

export type LegacyPillarSlug =
  | "startup-journey"
  | "b2b-experience"
  | "healthy-eating"
  | "discipline-lifestyle"
  | "faith-integrity";

export const LEGACY_PILLAR_MIGRATION: Record<
  LegacyPillarSlug,
  Record<Brand, { contentType: ContentType; subPillar: string }>
> = {
  "startup-journey": {
    seb: { contentType: "storytelling", subPillar: "founder-journey" },
    ublend: { contentType: "storytelling", subPillar: "behind-the-build" },
  },
  "b2b-experience": {
    seb: { contentType: "educational", subPillar: "business-lessons" },
    ublend: { contentType: "educational", subPillar: "b2b-education" },
  },
  "healthy-eating": {
    seb: { contentType: "educational", subPillar: "discipline-lifestyle" },
    ublend: { contentType: "educational", subPillar: "healthy-convenience" },
  },
  "discipline-lifestyle": {
    seb: { contentType: "educational", subPillar: "discipline-lifestyle" },
    ublend: { contentType: "educational", subPillar: "healthy-convenience" },
  },
  "faith-integrity": {
    seb: { contentType: "educational", subPillar: "faith-integrity" },
    ublend: { contentType: "educational", subPillar: "mission-vision" },
  },
};

export const SUGGESTED_WEEKLY_BALANCE: Record<
  Brand,
  Record<ContentType, number>
> = {
  seb: {
    educational: 1,
    storytelling: 1,
    authority: 1,
  },
  ublend: {
    educational: 1,
    storytelling: 1,
    authority: 1,
  },
};

export function getContentTypeMeta(value: ContentType | null | undefined) {
  if (!value) return null;
  return CONTENT_TYPES.find((type) => type.value === value) ?? null;
}

export type StorytellingStructure =
  | "big_goal_dream"
  | "challenge"
  | "breakthrough"
  | "about_me"
  | "heroes_journey"
  | "man_in_a_hole";

export type StorytellingStructureDef = {
  slug: StorytellingStructure;
  name: string;
  description: string;
  meaning: string;
  helper: string;
  bestFor: string[];
  important?: string;
  example: string;
  steps: Array<{ label: string; prompt: string }>;
};

export const STORYTELLING_STRUCTURE_HELPER =
  "A story arc is the shape of the post. It gives the content a beginning, middle, and end so the post has tension, movement, and a clear lesson.";

export const STORYTELLING_STRUCTURES: StorytellingStructureDef[] = [
  {
    slug: "big_goal_dream",
    name: "Big Goal / Dream",
    description:
      "Use this when the post is about a big ambition, vision, dream, or long-term goal.",
    meaning: "This is where I'm going.",
    helper: "Big ambition, vision, dream, or long-term goal.",
    bestFor: [
      "Founder vision posts",
      "uBlend mission posts",
      "Long-term business goals",
      "Big ambition posts",
    ],
    example:
      "I don't just want to sell smoothies. I want to build a system that makes healthy food more convenient.",
    steps: [
      { label: "Dream", prompt: "What is the ambition, vision, or long-term goal?" },
      { label: "Why it matters", prompt: "Why does this goal matter beyond you?" },
      { label: "Progress so far", prompt: "What has happened already?" },
      { label: "What I'm learning", prompt: "What is the journey teaching you?" },
      { label: "CTA / reflection", prompt: "What should the reader reflect on or do next?" },
    ],
  },
  {
    slug: "challenge",
    name: "Challenge",
    description:
      "Use this when the post is about an obstacle, hard moment, problem, or difficult decision.",
    meaning: "This is what I'm facing.",
    helper: "Obstacle, hard moment, problem, or difficult decision.",
    bestFor: [
      "Raw build updates",
      "Supplier problems",
      "Product development issues",
      "Founder journey posts",
      "Honest business lessons",
    ],
    example:
      "One of the hardest parts of building uBlend has been realising that the machine itself is only one part of the business.",
    steps: [
      { label: "Challenge", prompt: "What obstacle, problem, or decision are you facing?" },
      { label: "Why it mattered", prompt: "Why did this create pressure or risk?" },
      { label: "What I tried", prompt: "What action did you take first?" },
      { label: "Result", prompt: "What happened after that?" },
      { label: "Realisation", prompt: "What did the situation make clear?" },
      { label: "Lesson for reader", prompt: "What can someone else take from it?" },
    ],
  },
  {
    slug: "breakthrough",
    name: "Breakthrough",
    description:
      "Use this when the post is about a realisation, lesson, or shift in thinking.",
    meaning: "This is what I realised.",
    helper: "Realisation, lesson, or shift in thinking.",
    bestFor: [
      "Founder lessons",
      "Business lessons",
      "Leverage and systems posts",
      "Educational storytelling",
      "Mindset shifts",
    ],
    example:
      "I used to think the goal was to create a product. Now I realise the goal is to build a system.",
    steps: [
      { label: "Old belief / problem", prompt: "What did you used to believe or struggle with?" },
      { label: "Realisation", prompt: "What clicked?" },
      { label: "What changed", prompt: "How did your thinking or behaviour shift?" },
      { label: "Lesson", prompt: "What is the useful takeaway?" },
      { label: "Closing thought", prompt: "What final reflection should land with the reader?" },
    ],
  },
  {
    slug: "about_me",
    name: "About Me",
    description:
      "Use this when the post introduces who I am, what I care about, and why I am building what I am building.",
    meaning: "This is who I am.",
    helper: "Who I am, what I care about, and why I am building what I am building.",
    bestFor: [
      "Personal brand intro posts",
      "Founder origin stories",
      "Faith and integrity posts",
      "Personal reflection posts",
      "Pinned profile content",
    ],
    example:
      "I'm Sebastian, co-founder of uBlend. The deeper reason I'm building this is because I care about health, discipline, and building something useful.",
    steps: [
      { label: "Who I am", prompt: "How should the reader understand you?" },
      { label: "What I used to think", prompt: "What old belief or earlier version matters here?" },
      { label: "What changed", prompt: "What shifted your perspective?" },
      { label: "What I care about now", prompt: "What values or convictions guide you now?" },
      { label: "What I'm building", prompt: "How does that connect to the thing you're building?" },
    ],
  },
  {
    slug: "heroes_journey",
    name: "Hero's Journey",
    description:
      "Use this when the post tells a transformation story where a person, customer, venue, or business has a problem, finds a solution, and ends up in a better position.",
    meaning: "Here's how someone transforms.",
    helper: "Transformation story with a problem, solution, and better end state.",
    important:
      "For uBlend sales and B2B content, the customer or venue should usually be the hero, not uBlend. uBlend should be positioned as the guide / solution.",
    bestFor: [
      "Venue case posts",
      "Customer problem posts",
      "B2B sales content",
      "Website sections",
      "Transformation stories",
    ],
    example:
      "Most venues know customers want healthier options, but staff, queues, waste, and complexity make it difficult. uBlend is designed to solve that.",
    steps: [
      { label: "Hero / person / venue", prompt: "Who is the hero of the story?" },
      { label: "Problem", prompt: "What problem were they dealing with?" },
      { label: "Failed attempts", prompt: "What made previous attempts hard or incomplete?" },
      { label: "Solution", prompt: "What guide, system, or solution helped?" },
      { label: "Result", prompt: "What better position did they reach?" },
      { label: "CTA", prompt: "What should the reader do next?" },
    ],
  },
  {
    slug: "man_in_a_hole",
    name: "Man in a Hole",
    description:
      "Use this when the story starts stable, then a problem happens, then you recover and come out stronger.",
    meaning: "Here's what went wrong and how I came back stronger.",
    helper: "Starts stable, hits a problem, then recovers stronger.",
    bestFor: [
      "Honest founder posts",
      "Product setbacks",
      "Supplier / manufacturing problems",
      "Lessons from failure",
      "Strong storytelling posts",
    ],
    example:
      "We thought the machine was ready. Then we found the cleaning issue. That forced us to raise our standards.",
    steps: [
      { label: "Starting point", prompt: "What felt stable or ready at the start?" },
      { label: "Problem / trigger", prompt: "What went wrong?" },
      { label: "Low point", prompt: "What was the hardest moment?" },
      { label: "Recovery", prompt: "How did you respond or rebuild?" },
      { label: "Better place", prompt: "How are things stronger now?" },
      { label: "Lesson", prompt: "What did the setback teach you?" },
    ],
  },
];

const STORYTELLING_BY_SLUG = new Map(
  STORYTELLING_STRUCTURES.map((s) => [s.slug, s]),
);

export function getStorytellingStructure(slug: string | null | undefined) {
  if (!slug) return null;
  return STORYTELLING_BY_SLUG.get(slug as StorytellingStructure) ?? null;
}

export function getStorytellingStructureLabel(slug: string | null | undefined) {
  if (!slug) return null;
  return STORYTELLING_BY_SLUG.get(slug as StorytellingStructure)?.name ?? slug;
}

type StorytellingRule = {
  brand?: Brand;
  contentType?: ContentType;
  frameworkSlug?: string;
  structures: StorytellingStructure[];
};

const STORYTELLING_AUTO_SUGGESTIONS: StorytellingRule[] = [
  {
    brand: "seb",
    contentType: "storytelling",
    structures: ["about_me", "man_in_a_hole", "breakthrough", "big_goal_dream"],
  },
  {
    brand: "seb",
    frameworkSlug: "founder-reflection",
    structures: ["about_me", "breakthrough", "man_in_a_hole"],
  },
  {
    brand: "seb",
    frameworkSlug: "raw-build-update",
    structures: ["challenge", "man_in_a_hole", "breakthrough"],
  },
  {
    brand: "ublend",
    contentType: "storytelling",
    structures: ["big_goal_dream", "challenge", "heroes_journey", "man_in_a_hole"],
  },
  {
    brand: "ublend",
    frameworkSlug: "venue-case",
    structures: ["heroes_journey", "challenge", "breakthrough"],
  },
  {
    brand: "ublend",
    frameworkSlug: "problem-proof-lesson",
    structures: ["challenge", "breakthrough", "heroes_journey"],
  },
];

export function rankStorytellingStructures(
  brand: Brand | null | undefined,
  contentType: ContentType | null | undefined,
  frameworkSlug: string | null | undefined,
): StorytellingStructureDef[] {
  const score = new Map<StorytellingStructure, number>(
    STORYTELLING_STRUCTURES.map((s) => [s.slug, 0]),
  );
  for (const rule of STORYTELLING_AUTO_SUGGESTIONS) {
    if (rule.brand && rule.brand !== brand) continue;
    if (rule.contentType && rule.contentType !== contentType) continue;
    if (rule.frameworkSlug && rule.frameworkSlug !== frameworkSlug) continue;
    rule.structures.forEach((slug, index) => {
      const current = score.get(slug) ?? 0;
      score.set(slug, current + (rule.structures.length - index));
    });
  }
  return STORYTELLING_STRUCTURES.slice().sort((a, b) => {
    const scoreA = score.get(a.slug) ?? 0;
    const scoreB = score.get(b.slug) ?? 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export function getSuggestedStorytellingStructures(
  brand: Brand | null | undefined,
  contentType: ContentType | null | undefined,
  frameworkSlug: string | null | undefined,
): StorytellingStructure[] {
  const matched = new Set<StorytellingStructure>();
  for (const rule of STORYTELLING_AUTO_SUGGESTIONS) {
    if (rule.brand && rule.brand !== brand) continue;
    if (rule.contentType && rule.contentType !== contentType) continue;
    if (rule.frameworkSlug && rule.frameworkSlug !== frameworkSlug) continue;
    for (const slug of rule.structures) matched.add(slug);
  }
  return Array.from(matched);
}
