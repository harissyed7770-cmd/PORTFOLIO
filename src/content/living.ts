import type { VerifiedRecord } from "./ecosystem";

/**
 * The living parts of the universe. Update these files and redeploy —
 * the Lab and the Now screen are meant to change over time.
 */

export const labStages = ["Building", "Experimenting", "Exploring", "Archived", "Next"] as const;
export type LabStage = (typeof labStages)[number];

/** Domains the brief lists as currently being explored. */
export const labDomains = [
  "AI",
  "Products",
  "Automation",
  "Business models",
  "Digital media",
  "Education",
  "Social impact",
  "Real estate",
  "Experiments",
] as const;

export interface LabEntry extends VerifiedRecord {
  stage: LabStage;
  domain: (typeof labDomains)[number];
}

export const lab: { updated: string | null; entries: LabEntry[] } = {
  updated: null,
  entries: [],
};

export const nowChannels = ["Building", "Exploring", "Learning", "Connecting", "Experimenting", "Planning"] as const;
export type NowChannel = (typeof nowChannels)[number];

export const now: { updated: string | null; entries: Partial<Record<NowChannel, string[]>> } = {
  updated: null,
  entries: {},
};
