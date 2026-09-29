"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowDown, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useExperience } from "@/components/providers/Experience";
import { Coordinates, useVisible } from "@/components/ui/primitives";
import { domainLabel, themeLabel, themes, worldById, worlds, type ThemeId } from "@/content/ecosystem";
import { cn, scrollToId } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";

const EcosystemScene = dynamic(() => import("./EcosystemScene"), { ssr: false });

export function EcosystemSection() {
  const { reducedMotion } = useExperience();
  const [sectionRef, visible] = useVisible<HTMLElement>("200px");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [lens, setLens] = useState<ThemeId | null>(null);
  const [engaged, setEngaged] = useState(false);
  const touch = useMediaQuery("(pointer: coarse)");
  const [zoomSignal, setZoomSignal] = useState<{ n: number; dir: 1 | -1 }>({ n: 0, dir: 1 });
  const [resetSignal, setResetSignal] = useState(0);
  const mounted = useInView(sectionRef, { once: true, margin: "400px" });
  const panelRef = useRef<HTMLDivElement>(null);

  const select = useCallback((id: string | null) => {
    setSelected(id);
    if (id) setLens(null);
  }, []);

  const cycle = useCallback(
    (dir: 1 | -1) => {
      const i = worlds.findIndex((w) => w.id === selected);
      const next = worlds[(i + dir + worlds.length) % worlds.length];
      setSelected(next.id);
    },
    [selected],
  );

  // Explore mode: full screen, wheel zooms, page scroll paused.
  useEffect(() => {
    if (!engaged) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [engaged]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT") return;
      if (e.key === "Escape") {
        if (engaged) setEngaged(false);
        else if (selected) setSelected(null);
      }
      if (selected && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        cycle(e.key === "ArrowRight" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, engaged, selected, cycle]);

  const world = selected ? worldById[selected] : null;

  return (
    <section
      ref={sectionRef}
      id="ecosystem"
      data-hud
      aria-labelledby="ecosystem-title"
      className="relative h-[100svh] min-h-[640px] w-full bg-obsidian"
    >
      <div className={cn("overflow-hidden bg-obsidian", engaged ? "fixed inset-0 z-[70]" : "absolute inset-0")}>
      {mounted && (
        <EcosystemScene
          selected={selected}
          hovered={hovered}
          lens={lens}
          onSelect={select}
          onHover={setHovered}
          engaged={engaged}
          touch={touch}
          zoomSignal={zoomSignal}
          resetSignal={resetSignal}
          active={visible || engaged}
          reduced={reducedMotion}
        />
      )}

      <div aria-hidden className="pointer-events-none absolute inset-0 vignette opacity-70" />

      {/* Title */}
      <div
        className={cn(
          "gutter pointer-events-none absolute inset-x-0 top-0 z-10 pt-[calc(var(--hud-h)+1.5rem)] transition-opacity duration-700",
          world && "opacity-25",
        )}
      >
        <Coordinates code="02 / Ecosystem" items={["Spatial map", "11 worlds · 1 core"]} className="pointer-events-auto max-w-xl" />
        <h2 id="ecosystem-title" className="display mt-6 text-[clamp(2.6rem,6vw,5.5rem)] text-paper">
          The ecosystem
        </h2>
        <p className="editorial mt-2 max-w-md text-[clamp(1.1rem,1.6vw,1.45rem)] italic text-mist">
          {touch ? "Choose a world below, or open explore mode to rotate and zoom." : "Drag to rotate. Choose a world. Every line is a shared theme."}
        </p>
      </div>

      {/* World index — the accessible way into every planet. */}
      <nav
        aria-label="Worlds in the ecosystem"
        className="gutter absolute right-0 top-[calc(var(--hud-h)+1.5rem)] z-10 hidden max-h-[calc(100%-12rem)] overflow-y-auto lg:block"
        data-lenis-prevent
      >
        <ul className="flex flex-col items-end gap-1.5">
          {worlds.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => select(selected === w.id ? null : w.id)}
                onMouseEnter={() => setHovered(w.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(w.id)}
                onBlur={() => setHovered(null)}
                aria-pressed={selected === w.id}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-3 py-1.5 text-right transition-colors",
                  selected === w.id ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                <span className={cn("text-[0.85rem] transition-colors", selected === w.id ? "text-paper" : "text-mist group-hover:text-paper")}>
                  {w.name}
                </span>
                <span className="label-sm w-5 text-left" style={{ color: w.accent }}>
                  {w.mark}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Controls */}
      <div className="gutter absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-4 pb-6 md:pb-8">
        {/* Mobile world strip */}
        <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:hidden" data-lenis-prevent>
          <ul className="flex w-max gap-2" aria-label="Worlds">
            {worlds.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => select(selected === w.id ? null : w.id)}
                  aria-pressed={selected === w.id}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.8rem] transition-colors",
                    selected === w.id ? "border-white/50 bg-white/10 text-paper" : "border-white/12 text-mist",
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: w.accent }} />
                  {w.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div role="group" aria-label="Theme lenses" className="-mx-[var(--gutter)] flex max-w-full gap-1.5 overflow-x-auto px-[var(--gutter)] md:mx-0 md:flex-wrap md:px-0" data-lenis-prevent>
            <span className="label-sm hidden self-center pr-2 text-ash md:inline">Lens</span>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setLens(lens === t.id ? null : t.id);
                  setSelected(null);
                }}
                aria-pressed={lens === t.id}
                className={cn(
                  "label-sm shrink-0 rounded-full border px-3 py-2 transition-colors",
                  lens === t.id ? "border-paper bg-paper text-ink" : "border-white/12 text-mist hover:border-white/35 hover:text-paper",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton label="Zoom in" onClick={() => setZoomSignal((z) => ({ n: z.n + 1, dir: 1 }))}>
              <Plus className="h-4 w-4" />
            </IconButton>
            <IconButton label="Zoom out" onClick={() => setZoomSignal((z) => ({ n: z.n + 1, dir: -1 }))}>
              <Minus className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Reset view"
              onClick={() => {
                setSelected(null);
                setLens(null);
                setResetSignal((n) => n + 1);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </IconButton>
            <button
              type="button"
              onClick={() => setEngaged((e) => !e)}
              className="label-sm ml-1 flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-paper transition-colors hover:bg-paper hover:text-ink"
              aria-pressed={engaged}
            >
              {engaged ? <Minimize2 className="h-3.5 w-3.5" aria-hidden /> : <Maximize2 className="h-3.5 w-3.5" aria-hidden />}
              {engaged ? "Exit explore · Esc" : "Explore mode"}
            </button>
          </div>
        </div>
        {lens && (
          <p className="label-sm text-ash" aria-live="polite">
            Lens · {themeLabel(lens)} — {worlds.filter((w) => w.themes.includes(lens)).length} worlds share this theme
          </p>
        )}
      </div>

      {/* Selected world */}
      <AnimatePresence>
        {world && (
          <motion.div
            ref={panelRef}
            key={world.id}
            role="region"
            aria-live="polite"
            aria-label={`${world.name} — details`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute left-[var(--gutter)] right-[var(--gutter)] top-[46%] z-30 rounded-2xl bg-obsidian/60 p-6 sm:right-auto sm:w-[26rem] md:top-auto md:bottom-40"
            style={{ boxShadow: `0 30px 80px -30px ${world.accent}55` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="label-sm" style={{ color: world.accent }}>
                  {world.mark} · {domainLabel(world.domain)}
                </span>
                <h3 className="display mt-2 text-[2rem] text-paper">{world.name}</h3>
                <p className="label-sm mt-1 text-ash">{world.layer}</p>
              </div>
              <button type="button" onClick={() => select(null)} aria-label="Close" className="rounded-full p-1.5 text-ash hover:bg-white/10 hover:text-paper">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-mist">{world.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {world.themes.map((t) => (
                <span key={t} className="label-sm rounded-full border border-white/12 px-2.5 py-1 text-mist">
                  {themeLabel(t)}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setEngaged(false);
                  requestAnimationFrame(() => scrollToId(world.id === "cg-ed-foundation" || world.id === "sappta-support-foundation" ? "foundations" : world.id));
                }}
                className="label-sm group flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-ink"
              >
                Enter world <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden />
              </button>
              <div className="flex gap-1">
                <IconButton label="Previous world" onClick={() => cycle(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </IconButton>
                <IconButton label="Next world" onClick={() => cycle(1)}>
                  <ChevronRight className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-white/40 hover:text-paper"
    >
      {children}
    </button>
  );
}
