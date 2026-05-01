export type ContentFormatBlueprint = {
  slug: string;
  name: string;
  pillar: string;
  bestFor: string[];
  format: string;
  time: string;
  effort: string;
  purpose: string;
  structure: {
    hook: string;
    body: string;
    close: string;
  };
  examples: string[];
  captureSources: string[];
  weeklySlot: string;
  voice: string;
  proofPrompt: string;
  creativeCue: string;
};

export const contentFormatBlueprints: ContentFormatBlueprint[] = [
  {
    slug: "founder-lesson",
    name: "The Founder Lesson",
    pillar: "Startup Journey",
    bestFor: ["Seb LinkedIn", "Seb Instagram", "YouTube Shorts"],
    format: "Talking head or voiceover",
    time: "30–60 seconds",
    effort: "Low",
    purpose: "Turn live business lessons into founder authority.",
    structure: {
      hook: "Something I learned this week building uBlend…",
      body: "One clear lesson from suppliers, sales, product, venues, customers, pricing, or operations.",
      close: "Lesson: building a real business forces you to face the truth quickly.",
    },
    examples: [
      "What a Chinese supplier dispute taught me about product control.",
      "The mistake I made when assuming a machine was self-cleaning.",
      "Why a product business is 10x harder than an online business.",
    ],
    captureSources: ["Founder clip", "Proof / problem clip"],
    weeklySlot: "Monday founder authority post",
    voice: "First-person, direct, humble, earned.",
    proofPrompt: "Include the specific business situation that forced the lesson out of you.",
    creativeCue: "Storm light after pressure. Tension resolved into clarity.",
  },
  {
    slug: "raw-build-update",
    name: "The Raw Build Update",
    pillar: "Startup Journey",
    bestFor: ["Instagram Stories", "Reels", "LinkedIn"],
    format: "Quick update",
    time: "15–45 seconds",
    effort: "Very low",
    purpose: "Keep the audience close to the build with minimal effort.",
    structure: {
      hook: "Quick uBlend update…",
      body: "What happened. What it means. Next step.",
      close: "Keep it simple. No deep story needed.",
    },
    examples: [
      "We’re testing the blade cleaning issue today.",
      "We’re speaking to another venue this week.",
      "We’re refining the website visuals to feel more premium.",
    ],
    captureSources: ["Founder clip", "Proof / problem clip"],
    weeklySlot: "Stories anytime or Friday optional reel",
    voice: "Fast, present-tense, unpolished, close to the build.",
    proofPrompt: "Show exactly what changed this week and what happens next.",
    creativeCue: "Movement over perfection. Quick glimpses of the workshop.",
  },
  {
    slug: "problem-proof-lesson",
    name: "The Problem → Proof → Lesson Post",
    pillar: "Startup Journey / B2B Experience",
    bestFor: ["LinkedIn"],
    format: "Written post",
    time: "Short written post",
    effort: "Low",
    purpose: "Build trust by showing the real operating truth.",
    structure: {
      hook: "Problem: what issue showed up?",
      body: "Proof: why it matters in the real operating environment.",
      close: "Lesson: the principle this teaches. End with why you test before scaling.",
    },
    examples: [
      "Fruit residue around the blade shaft after cleaning.",
      "A commercial hygiene issue changed our assumptions.",
    ],
    captureSources: ["Proof / problem clip", "Founder clip"],
    weeklySlot: "Monday or Thursday trust-building post",
    voice: "Sober, honest, analytical, grounded in operations.",
    proofPrompt: "Name the actual friction or failure and why it matters commercially.",
    creativeCue: "Strong contrast. Raw force meets disciplined explanation.",
  },
  {
    slug: "ublend-experience-demo",
    name: "The uBlend Experience Demo",
    pillar: "User Experience",
    bestFor: ["uBlend Instagram", "Website", "Sales content"],
    format: "Visual reel",
    time: "15–30 seconds",
    effort: "Medium",
    purpose: "Make the product understandable in seconds.",
    structure: {
      hook: "POV or customer-use angle.",
      body: "Cup, machine, button/payment, blending close-up, finished smoothie.",
      close: "Real fruit. 60 seconds. Fully self-service.",
    },
    examples: [
      "From frozen fruit to smoothie in under 60 seconds.",
      "No staff. No queue. Just real fruit blended on demand.",
    ],
    captureSources: ["Product sequence", "Photos"],
    weeklySlot: "Friday optional reel or Tuesday visual post",
    voice: "Crisp, premium, visual-first, outcome-focused.",
    proofPrompt: "Show the product path clearly enough that a venue buyer understands it instantly.",
    creativeCue: "Elegant sequence, luminous surfaces, friction removed.",
  },
  {
    slug: "ingredient-truth",
    name: "The Ingredient Truth Post",
    pillar: "Healthy Eating Education",
    bestFor: ["uBlend Instagram", "LinkedIn", "Reels"],
    format: "Educational post",
    time: "20–45 seconds",
    effort: "Low / medium",
    purpose: "Support the transparency message with visible ingredients.",
    structure: {
      hook: "Most smoothies hide what is inside. We do the opposite.",
      body: "Show raw fruit in the cup. Explain exactly what is inside.",
      close: "Transparency is the product.",
    },
    examples: [
      "95g strawberry. 45g banana. Nothing hidden.",
      "Why we use visible frozen fruit instead of mystery mixes.",
      "Why clear cups matter.",
    ],
    captureSources: ["Product sequence", "Photos"],
    weeklySlot: "Tuesday product trust post",
    voice: "Confident, transparent, simple, educational.",
    proofPrompt: "Use visible ingredients, weights, or close-up evidence that nothing is hidden.",
    creativeCue: "Clean daylight. Honest composition. Ingredient-as-subject.",
  },
  {
    slug: "discipline-bridge",
    name: "The Discipline Bridge",
    pillar: "Discipline & Lifestyle",
    bestFor: ["Seb Instagram", "YouTube Shorts"],
    format: "Morning routine",
    time: "30–60 seconds",
    effort: "Medium",
    purpose: "Connect Seb’s lifestyle to the uBlend mission.",
    structure: {
      hook: "Discipline is easier when your environment supports it.",
      body: "Training, smoothie, quick reflection.",
      close: "Bridge personal discipline into food and business.",
    },
    examples: [
      "5am training, then real food. This is why I’m building uBlend.",
      "My morning routine: train, recover, build.",
    ],
    captureSources: ["Lifestyle sequence", "Photos"],
    weeklySlot: "Wednesday Seb Instagram",
    voice: "Disciplined, reflective, energised without performance.",
    proofPrompt: "Tie the training habit back to food, recovery, and the reason for building.",
    creativeCue: "Morning stillness with momentum underneath it.",
  },
  {
    slug: "venue-case",
    name: "The Venue Case Post",
    pillar: "B2B Experience",
    bestFor: ["uBlend LinkedIn"],
    format: "Decision-maker post",
    time: "Short written post",
    effort: "Low",
    purpose: "Sell the venue benefit clearly to decision-makers.",
    structure: {
      hook: "Most venues think healthy food needs staff. It doesn’t.",
      body: "Footfall, dwell time, customer experience, healthy option, low labour.",
      close: "uBlend is designed for gyms, offices, events and premium high-footfall spaces.",
    },
    examples: [
      "Why gyms should rethink post-workout nutrition.",
      "How a smoothie station improves experience without adding staff.",
    ],
    captureSources: ["Proof / problem clip", "No filming required"],
    weeklySlot: "Thursday B2B post",
    voice: "Commercial, clear, persuasive, decision-maker aware.",
    proofPrompt: "Spell out the venue upside in labour, experience, footfall, or dwell time.",
    creativeCue: "Architectural order. Structure, utility, and composed thinking.",
  },
  {
    slug: "founder-reflection",
    name: "The Founder Reflection",
    pillar: "Faith & Integrity",
    bestFor: ["Seb LinkedIn", "Seb Instagram"],
    format: "Written post or talking head",
    time: "Short reflection",
    effort: "Low",
    purpose: "Keep the personal brand deeper than surface-level business content.",
    structure: {
      hook: "Observation from the week.",
      body: "Biblical or principle-based reflection with business/life application.",
      close: "End with a question to the audience.",
    },
    examples: [
      "Building a company is exposing my impatience.",
      "Faith is how you decide when things go wrong.",
      "Discipline without purpose becomes pride.",
    ],
    captureSources: ["Founder clip", "Lifestyle sequence", "Photos"],
    weeklySlot: "Monday or Wednesday personal reflection",
    voice: "Still, thoughtful, principled, inward before outward.",
    proofPrompt: "Anchor the reflection in something that genuinely happened this week.",
    creativeCue: "Quiet ruins, long horizon, light arriving through shadow.",
  },
];

export const weeklyFlow = [
  {
    day: "Monday",
    title: "Plan + write",
    output: "Seb LinkedIn Founder Lesson",
    detail: "Write the founder lesson and the uBlend venue post. Choose the visuals you need.",
  },
  {
    day: "Tuesday",
    title: "Film + capture day",
    output: "Capture all reusable assets",
    detail: "Founder clip, product sequence, lifestyle sequence, proof clip, and five photos.",
  },
  {
    day: "Wednesday",
    title: "Edit + draft",
    output: "Seb IG + draft the week",
    detail: "Turn the Tuesday footage into the actual posts and optional short video.",
  },
  {
    day: "Thursday",
    title: "Post B2B content",
    output: "uBlend LinkedIn Venue Case",
    detail: "Publish the decision-maker post and keep follow-up simple.",
  },
  {
    day: "Friday",
    title: "Optional short video",
    output: "Reel / TikTok / Short",
    detail: "Reuse Tuesday product or founder footage without filming again.",
  },
];

export const captureSectionGuides = [
  {
    kind: "founder_clip",
    title: "Founder clip",
    target: 1,
    detail: "Target: 1 clip, 2–3 min",
    feeds: ["Founder Lesson", "Raw Build Update", "Founder Reflection"],
    prompt: "Film one talking-head clip about the strongest business lesson from the week.",
    placeholder: "Lesson or reflection title",
  },
  {
    kind: "product_clip",
    title: "Product sequence",
    target: 5,
    detail: "Target: fruit, cup in, blending, finished smoothie, branding",
    feeds: ["uBlend Experience Demo", "Ingredient Truth Post"],
    prompt: "Capture the five core product shots that explain the machine instantly.",
    placeholder: "Product sequence asset",
  },
  {
    kind: "lifestyle_clip",
    title: "Lifestyle sequence",
    target: 5,
    detail: "Target: gym, cycling, morning, laptop, nature, smoothie",
    feeds: ["Discipline Bridge", "Founder Reflection"],
    prompt: "Capture the discipline and founder-energy clips that connect Seb and uBlend.",
    placeholder: "Lifestyle sequence asset",
  },
  {
    kind: "proof_clip",
    title: "Proof / problem clip",
    target: 1,
    detail: "Target: testing, cleaning, supplier, machine issue",
    feeds: ["Problem → Proof → Lesson", "Founder Lesson", "Venue Case"],
    prompt: "Log the most useful proof point, friction point, or operating truth from the week.",
    placeholder: "Proof or problem asset",
  },
  {
    kind: "photo",
    title: "Photos",
    target: 5,
    detail: "Target: you, ingredients, cup, machine, lifestyle",
    feeds: ["Ingredient Truth", "Discipline Bridge", "Founder Reflection"],
    prompt: "Take the core stills you’ll reuse across Instagram, LinkedIn, and drafting.",
    placeholder: "Photo asset",
  },
] as const;
