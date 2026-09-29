import { domains, thematicLinks, worlds, type ThemeId, type World } from "@/content/ecosystem";

export interface PlacedWorld {
  world: World;
  position: [number, number, number];
}

/** Places each world in 3D: domains own sectors of the orbit, worlds share their domain's sector. */
export function placeWorlds(): PlacedWorld[] {
  const out: PlacedWorld[] = [];
  domains.forEach((d, di) => {
    const members = worlds.filter((w) => w.domain === d.id);
    const base = (di / domains.length) * Math.PI * 2 + 0.25;
    members.forEach((w, k) => {
      const offset = (k - (members.length - 1) / 2) * 0.38;
      const a = base + offset;
      const r = 5.6 + (k % 2 === 1 ? 1.6 : 0) + (members.length === 1 ? 0.6 : 0);
      const y = Math.sin(di * 1.7 + k * 1.3) * 1.35;
      out.push({ world: w, position: [Math.cos(a) * r, y, Math.sin(a) * r] });
    });
  });
  return out;
}

export interface PlacedLink {
  a: string;
  b: string;
  themes: ThemeId[];
}

export const placedLinks: PlacedLink[] = thematicLinks();
