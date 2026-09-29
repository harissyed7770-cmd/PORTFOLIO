# Haris Afnan — a personal digital universe

Not a portfolio. A Founder OS: one person at the centre, eleven worlds in orbit, and the ecosystem that connects them.

```
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` in production (see `.env.example`). It drives canonical URLs, the sitemap and Open Graph.

## The experience

| #  | Section | What it does |
|----|---------|--------------|
| 00 | **Genesis** | Darkness → one point of light → thousands of particles → eight constellations (AI, Business, Education, Media, Real Estate, Social Impact, Technology, People) → the particles converge onto the real typography of the name → they release into a million-point network. *Enter the ecosystem →* unlocks the page. WebGL (R3F + custom shaders), sequenced with a GSAP timeline. |
| 01 | **Not One Company** | Scroll-pinned typography: *I didn't build one company.* (struck through) → *I built an ecosystem.* → one dot bursts into the eleven worlds. |
| 02 | **The Ecosystem** | The signature 3D map. Every world is a planet with its own form. Drag to rotate, zoom, choose a world (the camera flies to it), filter by theme lens, or open full-screen explore mode. Fully keyboard-reachable through the world index. |
| 03–12 | **The worlds** | Each world has its own visual language: Xenovo Tech (exploded architectural stack), Xenovo Enterprises (the Enterprise Engine, one SVG form morphing through five stages), Samyam (a simulation chamber: Sense → Rehearse → Resolve), DigiMitraa (a particle growth engine), Scholar4Study (a bright editorial knowledge graph), JobTimes24 (a living talent→opportunity flow map), TrendTimes (a newsroom command centre), NGO Nexus (people becoming communities, night becoming dawn), the Foundation Network, and MOSSCO Realty (a generated survey map with terrain, parcels and architectural massing). |
| 13 | **The One Million Network** | Renders **1,000,000 points** on capable devices (fewer on phones, with the exact ratio stated on screen). Scroll flies the camera into the network. |
| 14 | **The Build** | A horizontal journey (GSAP ScrollTrigger) of twelve chapters, each opening a memory capsule. Vertical on mobile. |
| 15 | **How I Think** | The principle revealed word by word, then the seven-step loop that ends in *Build again.* |
| 16 | **The Lab** | Building / Experimenting / Exploring / Archived / Next. |
| 17 | **Atlas** | Every relationship as a living orrery — or as a literal tree (Index view). |
| 18 | **Now** | A live transmission console. |
| 19 | **What doesn't exist yet?** | Ghost planets for what hasn't been built. |
| 20 | **What are we building next?** | *One person. Multiple worlds. One ecosystem.* → the name → the open question. |

Press **/** or **⌘K** anywhere to open the navigator.

## The verified-only protocol

The brief asked for zero fabrication. The code enforces it structurally:

- **Every fact lives in `src/content/`.** Components never hard-code claims about Haris or his companies.
- **Missing facts render as open slots**, not placeholders pretending to be real: *Awaiting verified record*, *Sealed*, *awaiting transmission*.
- **Illustrations are labelled as illustrations**: the Samyam scenario nodes, the JobTimes24 flows, the network clusters, the MOSSCO parcels and TrendTimes' greeked copy all say so on screen.
- No user numbers, impact figures, dates, testimonials, headlines or URLs were invented. The only URL set is `samyam.app`, which was in the brief.

See **[CONTENT.md](./CONTENT.md)** for how to add verified information.

## Architecture

```
src/
  app/                 layout (fonts, metadata, JSON-LD), page, OG image, sitemap, robots, manifest
  content/             ecosystem.ts · journey.ts · living.ts · sections.ts — the single source of truth
  components/
    providers/         Experience: genesis phase, Lenis smooth scroll ↔ GSAP ticker, reduced motion
    chrome/            HUD, ⌘K command palette, footer
    genesis/           intro overlay + WebGL particle scene
    ecosystem/         3D ecosystem map (R3F) + overlay UI
    worlds/            one component per world, wrapped in WorldShell (coordinates + verified record)
    sections/          network, build, mind, lab, atlas, now, future, finale
    ui/                primitives (reveal, open slot, lazy mount), magnetic button
  hooks/useClient.ts   hydration-safe browser readers (useSyncExternalStore)
  lib/                 utilities, text→particle sampling, boot script
```

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP + ScrollTrigger · Three.js / React Three Fiber / drei · Lenis · Lucide · d3-contour.

### Performance

- Every WebGL scene is code-split (`next/dynamic`, `ssr: false`), paused when off-screen (`frameloop="never"`), and sized to the device (particle counts come from a device tier).
- 2D canvases only run their animation loop while visible.
- Fonts are self-hosted through `next/font`. The page is statically prerendered.
- A tiny pre-paint script decides whether the intro plays (first visit), or goes straight to the final frame (deep links, return visits in the session, reduced motion). The first frame is always correct.

### Accessibility

- Semantic sections with headings; canvases are `aria-hidden` and carry text equivalents.
- Keyboard: skip link, `/` and `⌘K` navigator, Esc skips the intro, arrow keys cycle planets, and every interactive visual has a button equivalent.
- `prefers-reduced-motion`: no intro, no smooth scrolling, still scenes.

### Deploying

The app lives at the repository root. Set `NEXT_PUBLIC_SITE_URL` in production.
