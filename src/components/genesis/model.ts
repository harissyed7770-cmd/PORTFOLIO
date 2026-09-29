/** Shared between the genesis DOM overlay and the WebGL scene. */

export interface GenesisState {
  /** 0 origin → 1 cloud → 2 constellations → 3 name → 4 network */
  morph: number;
  /** Connections between constellations. */
  lines: number;
  /** The far field of the network. */
  field: number;
  /** Relationships inside the network. */
  netLines: number;
  opacity: number;
  /** Forward travel when entering the ecosystem. */
  warp: number;
}

export interface GenesisTargets {
  /** Normalized text points [x, y, x, y...] relative to the scene frame. */
  text: Float32Array | null;
  version: number;
}

export const initialGenesisState = (): GenesisState => ({
  morph: 0,
  lines: 0,
  field: 0,
  netLines: 0,
  opacity: 1,
  warp: 0,
});

export const finalGenesisState = (): GenesisState => ({
  morph: 4,
  lines: 0,
  field: 1,
  netLines: 1,
  opacity: 1,
  warp: 0,
});

/**
 * The eight constellations that appear before the name.
 * PEOPLE sits at the centre — every other domain connects through people.
 * Positions are normalized to the frame (x right, y up).
 */
export const constellations = [
  { word: "People", tint: "#F3F1EB", x: 0, y: 0.02, weight: 1.6 },
  { word: "AI", tint: "#9CC3BD", x: 0, y: 0.33, weight: 1 },
  { word: "Technology", tint: "#9DB2C6", x: 0.27, y: 0.22, weight: 1 },
  { word: "Business", tint: "#C4A877", x: 0.33, y: -0.06, weight: 1 },
  { word: "Real Estate", tint: "#A3AE7C", x: 0.2, y: -0.3, weight: 1 },
  { word: "Social Impact", tint: "#E8B68C", x: -0.2, y: -0.3, weight: 1 },
  { word: "Education", tint: "#8FA3F2", x: -0.33, y: -0.06, weight: 1 },
  { word: "Media", tint: "#C98372", x: -0.27, y: 0.22, weight: 1 },
] as const;

/** Mobile frames are tall: pull constellations toward the vertical axis. */
export function constellationPosition(i: number, aspect: number) {
  const c = constellations[i];
  if (aspect >= 0.9) return { x: c.x, y: c.y };
  return { x: c.x * 1.18, y: c.y * 0.82 };
}

/** Order in which the words are revealed — as written in the brief. */
export const revealOrder = ["AI", "Business", "Education", "Media", "Real Estate", "Social Impact", "Technology", "People"];

export const constellationEdges: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 1],
];
