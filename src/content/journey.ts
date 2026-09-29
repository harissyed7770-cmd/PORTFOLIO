import type { VerifiedRecord } from "./ecosystem";

/**
 * THE BUILD — the chapters of the journey, in the order supplied in the brief.
 * No dates, places or anecdotes are filled in until the founder supplies them.
 * `worlds` links a chapter to the worlds the brief associates with that layer.
 */

export const capsuleKinds = [
  "Photos",
  "Documents",
  "Projects",
  "Videos",
  "Articles",
  "Screens",
  "Posts",
  "Events",
  "People",
  "Lessons",
] as const;

export type CapsuleKind = (typeof capsuleKinds)[number];

export interface Chapter {
  id: string;
  title: string;
  /** Year / period — only when supplied. */
  period: string | null;
  worlds: string[];
  /** Verified memories, grouped by capsule kind. */
  memories: Partial<Record<CapsuleKind, VerifiedRecord[]>>;
  /** A verified fact that belongs to this chapter (from the brief). */
  note?: string;
}

export const chapters: Chapter[] = [
  { id: "origin", title: "Origin", period: null, worlds: [], memories: {} },
  { id: "first-idea", title: "First Idea", period: null, worlds: [], memories: {} },
  { id: "first-project", title: "First Project", period: null, worlds: [], memories: {} },
  { id: "digital-growth", title: "Digital Growth", period: null, worlds: ["digimitraa"], memories: {} },
  { id: "education", title: "Education", period: null, worlds: ["scholar4study"], memories: {} },
  { id: "media", title: "Media", period: null, worlds: ["trendtimes"], memories: {} },
  {
    id: "social-impact",
    title: "Social Impact",
    period: null,
    worlds: ["ngo-nexus", "cg-ed-foundation", "sappta-support-foundation"],
    memories: {},
  },
  { id: "real-estate", title: "Real Estate", period: null, worlds: ["mossco-realty"], memories: {} },
  { id: "ai", title: "AI", period: null, worlds: ["samyam", "xenovo-tech"], memories: {} },
  {
    id: "ecosystem",
    title: "Ecosystem",
    period: null,
    worlds: [
      "xenovo-tech",
      "xenovo-enterprises",
      "samyam",
      "digimitraa",
      "scholar4study",
      "jobtimes24",
      "trendtimes",
      "ngo-nexus",
      "cg-ed-foundation",
      "sappta-support-foundation",
      "mossco-realty",
    ],
    memories: {},
    note: "Eleven worlds. One ecosystem.",
  },
  {
    id: "network",
    title: "1M+ Network",
    period: null,
    worlds: [],
    memories: {},
    note: "1,000,000+ followers on LinkedIn.",
  },
  { id: "next", title: "Next", period: null, worlds: [], memories: {}, note: "Not built yet." },
];
