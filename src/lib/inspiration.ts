export type InspirationArtwork = {
  src: string;
  title: string;
  artist: string;
  mood: string;
};

export const inspirationArtworks: InspirationArtwork[] = [
  {
    src: "/inspiration/california-spring.jpg",
    title: "California Spring",
    artist: "Albert Bierstadt",
    mood: "Light, renewal, weekly reset",
  },
  {
    src: "/inspiration/niagara-falls.jpg",
    title: "Niagara Falls",
    artist: "Albert Bierstadt",
    mood: "Force, motion, raw proof",
  },
  {
    src: "/inspiration/puget-sound.jpg",
    title: "Puget Sound on the Pacific Coast",
    artist: "Albert Bierstadt",
    mood: "Scale, drama, founder pressure",
  },
  {
    src: "/inspiration/passing-shower.jpg",
    title: "Passing Shower in the Tropics",
    artist: "Frederic Edwin Church",
    mood: "Atmosphere, weather, momentum",
  },
  {
    src: "/inspiration/coming-storm.jpg",
    title: "The Coming Storm",
    artist: "Albert Bierstadt",
    mood: "Tension, truth, consequence",
  },
  {
    src: "/inspiration/kuindshi-cloud.jpg",
    title: "Cloud Study",
    artist: "Arkhip Kuindzhi",
    mood: "Open sky, calm, room to think",
  },
  {
    src: "/inspiration/piazza-san-marco.jpg",
    title: "The Piazza San Marco in Venice",
    artist: "Canaletto",
    mood: "Structure, order, composition",
  },
  {
    src: "/inspiration/tintern-abbey.jpg",
    title: "Tintern Abbey",
    artist: "Carl Gustav Carus",
    mood: "Quiet depth, reflection, faith",
  },
  {
    src: "/inspiration/jerusalem.jpg",
    title: "Jerusalem from the Mount of Olives",
    artist: "Frederic Edwin Church",
    mood: "Vision, meaning, long horizon",
  },
  {
    src: "/inspiration/course-of-empire.jpg",
    title: "The Consummation of the Course of the Empire",
    artist: "Thomas Cole",
    mood: "Grandeur, consequence, civilization",
  },
  {
    src: "/inspiration/florence.jpg",
    title: "View of Florence from San Miniato",
    artist: "Thomas Cole",
    mood: "Perspective, clarity, culture",
  },
  {
    src: "/inspiration/dordrecht.jpg",
    title: "Dordrecht",
    artist: "Turner School",
    mood: "Glow, reflection, gentle rhythm",
  },
  {
    src: "/inspiration/burning-houses.jpg",
    title: "The Burning of the Houses of Lords and Commons",
    artist: "J. M. W. Turner",
    mood: "Intensity, urgency, creative fire",
  },
];

export const featuredInspiration = {
  dashboard: inspirationArtworks[0],
  capture: inspirationArtworks[3],
  formats: inspirationArtworks[6],
  content: inspirationArtworks[10],
  calendar: inspirationArtworks[11],
  pipeline: inspirationArtworks[12],
  kpis: inspirationArtworks[1],
};

export const formatArtworkBySlug: Record<string, InspirationArtwork> = {
  "founder-lesson": inspirationArtworks[4],
  "raw-build-update": inspirationArtworks[12],
  "problem-proof-lesson": inspirationArtworks[1],
  "ublend-experience-demo": inspirationArtworks[11],
  "ingredient-truth": inspirationArtworks[0],
  "discipline-bridge": inspirationArtworks[10],
  "venue-case": inspirationArtworks[9],
  "founder-reflection": inspirationArtworks[7],
};
