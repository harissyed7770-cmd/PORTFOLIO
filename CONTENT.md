# Adding verified content

Everything the universe says comes from four files in `src/content/`. Add only information that Haris Afnan has supplied or confirmed. Anything left empty stays visible as an honest open slot.

## `ecosystem.ts`

**Person.** Set the public links to reveal the LinkedIn call to action in the finale and add `sameAs` to the structured data:

```ts
links: {
  linkedin: "https://www.linkedin.com/in/…",
  email: null,
},
```

**Worlds.** For each world you can set:

| Field | Effect |
|-------|--------|
| `url` | Shows the official link in the world's record, in the finale and in structured data. |
| `records` | Real projects, initiatives or portfolio items. They appear in the world's *Verified record*, and in the Xenovo Tech registry. |
| `summary` | Replace it with the founder's own description at any time. |

```ts
records: [
  { title: "Project name", detail: "One line, as the founder describes it", href: "https://…" },
],
```

**Foundations.** `foundationRecords` holds the text for Mission, Work, Initiatives, Communities, Impact and Partnerships. Only publish impact figures that can be verified.

```ts
"cg-ed-foundation": { Mission: "…", Work: "…" },
```

## `journey.ts` — The Build

Each chapter takes an optional `period` (for example `"2019"`), a `note`, and `memories` grouped by capsule kind: Photos, Documents, Projects, Videos, Articles, Screens, Posts, Events, People, Lessons.

```ts
memories: {
  Projects: [{ title: "…", href: "https://…" }],
  Lessons: [{ title: "…" }],
},
```

## `living.ts` — The Lab and Now

These are meant to change often. Update `updated` each time.

```ts
export const lab = {
  updated: "2026-10-01",
  entries: [{ title: "…", stage: "Building", domain: "AI" }],
};

export const now = {
  updated: "2026-10-01",
  entries: { Building: ["…"], Learning: ["…"] },
};
```

## `sections.ts`

The map used by the HUD and the ⌘K navigator. Edit it only if sections are added or reordered.
