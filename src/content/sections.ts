/** The map of the universe, used by the HUD, the command palette and the atlas. */

export interface SectionEntry {
  id: string;
  code: string;
  title: string;
  group: "Genesis" | "Ecosystem" | "Worlds" | "Network" | "Journey" | "Mind" | "Living" | "Future";
  hint: string;
}

export const sections: SectionEntry[] = [
  { id: "genesis", code: "00", title: "Genesis", group: "Genesis", hint: "From one point of light" },
  { id: "not-one-company", code: "01", title: "Not One Company", group: "Ecosystem", hint: "The premise" },
  { id: "ecosystem", code: "02", title: "The Ecosystem", group: "Ecosystem", hint: "Explore in 3D" },
  { id: "xenovo-tech", code: "03", title: "Xenovo Tech", group: "Worlds", hint: "Technology pillar" },
  { id: "xenovo-enterprises", code: "04", title: "Xenovo Enterprises", group: "Worlds", hint: "The Enterprise Engine" },
  { id: "samyam", code: "05", title: "Samyam", group: "Worlds", hint: "AI simulation chamber" },
  { id: "digimitraa", code: "06", title: "DigiMitraa", group: "Worlds", hint: "Digital growth engine" },
  { id: "scholar4study", code: "07", title: "Scholar4Study", group: "Worlds", hint: "Education universe" },
  { id: "jobtimes24", code: "08", title: "JobTimes24", group: "Worlds", hint: "Employment map" },
  { id: "trendtimes", code: "09", title: "TrendTimes", group: "Worlds", hint: "Digital newsroom" },
  { id: "ngo-nexus", code: "10", title: "NGO Nexus", group: "Worlds", hint: "Social impact" },
  { id: "foundations", code: "11", title: "Foundation Network", group: "Worlds", hint: "CG & ED · Sappta" },
  { id: "mossco-realty", code: "12", title: "MOSSCO Realty", group: "Worlds", hint: "The physical world" },
  { id: "network", code: "13", title: "The One Million Network", group: "Network", hint: "Scale of connection" },
  { id: "the-build", code: "14", title: "The Build", group: "Journey", hint: "Memory capsules" },
  { id: "how-i-think", code: "15", title: "How I Think", group: "Mind", hint: "The manifesto" },
  { id: "the-lab", code: "16", title: "The Lab", group: "Living", hint: "What is being explored" },
  { id: "atlas", code: "17", title: "Ecosystem Atlas", group: "Ecosystem", hint: "Every relationship" },
  { id: "now", code: "18", title: "Now", group: "Living", hint: "Current transmission" },
  { id: "future", code: "19", title: "What Doesn't Exist Yet?", group: "Future", hint: "Possibility" },
  { id: "next", code: "20", title: "What Are We Building Next?", group: "Future", hint: "The open question" },
];

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<string, SectionEntry>;
