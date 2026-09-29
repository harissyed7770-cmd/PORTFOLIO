/**
 * THE SINGLE SOURCE OF TRUTH.
 *
 * Every fact rendered anywhere in the universe comes from the /content folder.
 * Everything here was supplied in the founder brief. Nothing is inferred,
 * estimated or invented. Fields that have not been supplied are `null` or empty
 * arrays, and the interface renders them as open slots ("awaiting record")
 * instead of filling them with placeholder claims.
 *
 * To add verified information, edit these files. See CONTENT.md.
 */

export type ThemeId =
  | "technology"
  | "ai"
  | "entrepreneurship"
  | "digital-growth"
  | "education"
  | "employment"
  | "media"
  | "social-impact"
  | "real-estate";

export type DomainId =
  | "technology"
  | "digital-growth"
  | "education"
  | "employment"
  | "media"
  | "social-impact"
  | "real-estate";

export type WorldForm =
  | "lattice"
  | "faceted"
  | "ringed"
  | "halo"
  | "globe"
  | "dial"
  | "scan"
  | "community"
  | "bloom"
  | "terrain";

/** A verified, founder-supplied record (a project, initiative, milestone, link...). */
export interface VerifiedRecord {
  title: string;
  detail?: string;
  href?: string;
  date?: string;
}

export interface World {
  id: string;
  name: string;
  /** Short monogram used in HUD and 3D labels. */
  mark: string;
  domain: DomainId;
  /** The role this world plays in the ecosystem, as described in the brief. */
  layer: string;
  /** One or two sentences, drawn only from the founder brief. */
  summary: string;
  /** The vocabulary the brief assigns to this world. Concepts, not claims. */
  vocabulary: string[];
  themes: ThemeId[];
  /** Accent for dark environments. */
  accent: string;
  form: WorldForm;
  /** Official URL. Only set when supplied by the founder. */
  url: string | null;
  /** Founder-supplied projects / initiatives / portfolio. Empty until supplied. */
  records: VerifiedRecord[];
}

export interface Domain {
  id: DomainId;
  label: string;
}

export interface Theme {
  id: ThemeId;
  label: string;
}

export const person = {
  name: "Haris Afnan",
  firstName: "Haris",
  lastName: "Afnan",
  positioning: [
    "Founder",
    "Entrepreneur",
    "AI Builder",
    "Digital Strategist",
    "Ecosystem Builder",
    "Social Impact Builder",
  ],
  tagline: "Building ideas into ecosystems.",
  closing: "Building what comes next.",
  audience: {
    value: 1_000_000,
    display: "1,000,000+",
    platform: "LinkedIn",
    unit: "followers",
  },
  principle: {
    lead: "AI should strengthen",
    emphasis: "human judgment,",
    tail: "not replace it.",
  },
  principles: [
    "Understand people.",
    "Remove friction.",
    "Build practical systems.",
    "Experiment.",
    "Learn.",
    "Iterate.",
    "Build again.",
  ],
  /** Set these when the founder supplies them. Components hide missing links. */
  links: {
    linkedin: null as string | null,
    email: null as string | null,
  },
} as const;

export const themes: Theme[] = [
  { id: "technology", label: "Technology" },
  { id: "ai", label: "AI" },
  { id: "entrepreneurship", label: "Entrepreneurship" },
  { id: "digital-growth", label: "Digital Growth" },
  { id: "education", label: "Education" },
  { id: "employment", label: "Employment" },
  { id: "media", label: "Media" },
  { id: "social-impact", label: "Social Impact" },
  { id: "real-estate", label: "Real Estate" },
];

export const domains: Domain[] = [
  { id: "technology", label: "Technology" },
  { id: "digital-growth", label: "Digital Growth" },
  { id: "media", label: "Media" },
  { id: "employment", label: "Employment" },
  { id: "education", label: "Education" },
  { id: "social-impact", label: "Social Impact" },
  { id: "real-estate", label: "Real Estate" },
];

export const worlds: World[] = [
  {
    id: "xenovo-tech",
    name: "Xenovo Tech",
    mark: "XT",
    domain: "technology",
    layer: "The technology pillar",
    summary:
      "The technology pillar of the ecosystem. Its language is AI, software, automation, products, digital infrastructure and experimentation.",
    vocabulary: ["AI", "Software", "Automation", "Products", "Digital Infrastructure", "Experimentation"],
    themes: ["technology", "ai", "entrepreneurship"],
    accent: "#9DB2C6",
    form: "lattice",
    url: null,
    records: [],
  },
  {
    id: "xenovo-enterprises",
    name: "Xenovo Enterprises",
    mark: "XE",
    domain: "technology",
    layer: "The venture & business layer",
    summary:
      "The venture and business layer. The Enterprise Engine: how an idea can move from experiment, to product, to business, to ecosystem.",
    vocabulary: ["Idea", "Experiment", "Product", "Business", "Ecosystem"],
    themes: ["entrepreneurship", "technology"],
    accent: "#C4A877",
    form: "faceted",
    url: null,
    records: [],
  },
  {
    id: "samyam",
    name: "Samyam",
    mark: "SM",
    domain: "technology",
    layer: "The AI simulation lab",
    summary:
      "An AI-native simulation system. Scenario labs for high-stakes situations, built around reconciliation, resolution and restoration.",
    vocabulary: ["Sense", "Rehearse", "Resolve", "Reconciliation", "Resolution", "Restoration"],
    themes: ["ai", "technology"],
    accent: "#9CC3BD",
    form: "ringed",
    url: "https://samyam.app",
    records: [],
  },
  {
    id: "digimitraa",
    name: "DigiMitraa",
    mark: "DM",
    domain: "digital-growth",
    layer: "The digital growth & branding layer",
    summary:
      "The digital growth and online branding layer: campaign planning, social media strategy, SEO, creative content, digital outreach, digital identity, measurable growth and long-term marketing systems.",
    vocabulary: [
      "Campaign planning",
      "Social media strategy",
      "SEO",
      "Creative content",
      "Digital outreach",
      "Digital identity",
      "Measurable growth",
      "Long-term marketing systems",
    ],
    themes: ["digital-growth", "media", "entrepreneurship"],
    accent: "#D69574",
    form: "halo",
    url: null,
    records: [],
  },
  {
    id: "scholar4study",
    name: "Scholar4Study",
    mark: "S4",
    domain: "education",
    layer: "The education world",
    summary:
      "The education world. Its map is made of knowledge, scholarships, student pathways, college discovery and career pathways.",
    vocabulary: ["Knowledge", "Scholarships", "Student pathways", "College discovery", "Career pathways"],
    themes: ["education"],
    accent: "#8FA3F2",
    form: "globe",
    url: null,
    records: [],
  },
  {
    id: "jobtimes24",
    name: "JobTimes24",
    mark: "24",
    domain: "employment",
    layer: "The employment world",
    summary:
      "The employment world, where talent meets opportunity: students, graduates, skills, jobs and employers.",
    vocabulary: ["Students", "Graduates", "Skills", "Jobs", "Employers", "Opportunities"],
    themes: ["employment", "education"],
    accent: "#D8A64B",
    form: "dial",
    url: null,
    records: [],
  },
  {
    id: "trendtimes",
    name: "TrendTimes",
    mark: "TT",
    domain: "media",
    layer: "The media world",
    summary:
      "The media platform: news, trends, stories, people, ideas, culture and digital conversations.",
    vocabulary: ["News", "Trends", "Stories", "People", "Ideas", "Culture", "Digital conversations"],
    themes: ["media", "digital-growth"],
    accent: "#CF5A44",
    form: "scan",
    url: null,
    records: [],
  },
  {
    id: "ngo-nexus",
    name: "NGO Nexus",
    mark: "NX",
    domain: "social-impact",
    layer: "The social impact world",
    summary:
      "The social impact world: people, communities, NGOs, volunteers, education and opportunity.",
    vocabulary: ["People", "Communities", "NGOs", "Volunteers", "Education", "Opportunity", "Social impact"],
    themes: ["social-impact"],
    accent: "#E8B68C",
    form: "community",
    url: null,
    records: [],
  },
  {
    id: "cg-ed-foundation",
    name: "CG & ED Foundation",
    mark: "CG",
    domain: "social-impact",
    layer: "Foundation · impact constellation",
    summary: "A foundation in the social impact constellation.",
    vocabulary: ["Mission", "Work", "Initiatives", "Communities", "Impact", "Partnerships"],
    themes: ["social-impact"],
    accent: "#A9C2A2",
    form: "bloom",
    url: null,
    records: [],
  },
  {
    id: "sappta-support-foundation",
    name: "Sappta Support Foundation",
    mark: "SF",
    domain: "social-impact",
    layer: "Foundation · impact constellation",
    summary: "A foundation in the social impact constellation.",
    vocabulary: ["Mission", "Work", "Initiatives", "Communities", "Impact", "Partnerships"],
    themes: ["social-impact"],
    accent: "#D4A39A",
    form: "bloom",
    url: null,
    records: [],
  },
  {
    id: "mossco-realty",
    name: "MOSSCO Realty",
    mark: "MR",
    domain: "real-estate",
    layer: "The physical-world layer",
    summary:
      "The real estate layer, where the ecosystem meets the physical world: architecture, landscape, geography, development and investment.",
    vocabulary: ["Architecture", "Landscape", "Property", "Geography", "Development", "Investment"],
    themes: ["real-estate", "entrepreneurship"],
    accent: "#A3AE7C",
    form: "terrain",
    url: null,
    records: [],
  },
];

export const worldById = Object.fromEntries(worlds.map((w) => [w.id, w])) as Record<string, World>;

export function worldsInDomain(domain: DomainId) {
  return worlds.filter((w) => w.domain === domain);
}

export function themeLabel(id: ThemeId) {
  return themes.find((t) => t.id === id)?.label ?? id;
}

export function domainLabel(id: DomainId) {
  return domains.find((d) => d.id === id)?.label ?? id;
}

/**
 * Thematic connections between worlds. Two worlds are linked when they share
 * a theme from the brief. This is a conceptual map, not a claim about
 * operational or legal relationships.
 */
export function thematicLinks() {
  const links: { a: string; b: string; themes: ThemeId[] }[] = [];
  for (let i = 0; i < worlds.length; i++) {
    for (let j = i + 1; j < worlds.length; j++) {
      const shared = worlds[i].themes.filter((t) => worlds[j].themes.includes(t));
      if (shared.length) links.push({ a: worlds[i].id, b: worlds[j].id, themes: shared });
    }
  }
  return links;
}

export const foundationFields = ["Mission", "Work", "Initiatives", "Communities", "Impact", "Partnerships"] as const;
export type FoundationField = (typeof foundationFields)[number];

/**
 * Verified text for each foundation field. Empty until supplied — the
 * interface shows an open slot, and never an estimated or invented figure.
 */
export const foundationRecords: Record<string, Partial<Record<FoundationField, string>>> = {
  "cg-ed-foundation": {},
  "sappta-support-foundation": {},
};
