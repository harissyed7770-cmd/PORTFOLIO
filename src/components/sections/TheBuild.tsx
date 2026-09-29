"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Archive, ArrowRight, X } from "lucide-react";
import { capsuleKinds, chapters, type Chapter } from "@/content/journey";
import { worldById } from "@/content/ecosystem";
import { Coordinates } from "@/components/ui/primitives";
import { cn, scrollToId } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function CapsuleDialog({ chapter, index, onClose }: { chapter: Chapter; index: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      prev?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const total = capsuleKinds.reduce((n, k) => n + (chapter.memories[k]?.length ?? 0), 0);

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-obsidian/75 p-3 backdrop-blur-md sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capsule-title"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-graphite-900/90 p-6 md:p-10"
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label-sm text-ash">
              Memory capsule · chapter {String(index + 1).padStart(2, "0")}
            </p>
            <h3 id="capsule-title" className="display mt-3 text-[clamp(2.4rem,6vw,4.6rem)] text-paper">
              {chapter.title}
            </h3>
            <p className="label-sm mt-2 text-mist">{chapter.period ?? "Period · awaiting founder input"}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 p-2.5 text-mist transition-colors hover:border-white/40 hover:text-paper"
            aria-label="Close capsule"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {chapter.note && <p className="editorial mt-6 text-[clamp(1.4rem,2.4vw,2rem)] italic text-platinum">{chapter.note}</p>}

        {chapter.worlds.length > 0 && (
          <div className="mt-6">
            <p className="label-sm text-ash">Worlds in this chapter</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {chapter.worlds.map((id) => {
                const w = worldById[id];
                const target = id === "cg-ed-foundation" || id === "sappta-support-foundation" ? "foundations" : id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        requestAnimationFrame(() => scrollToId(target));
                      }}
                      className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[0.85rem] text-mist transition-colors hover:border-white/40 hover:text-paper"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: w.accent }} />
                      {w.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {capsuleKinds.map((k) => {
            const items = chapter.memories[k] ?? [];
            return (
              <div
                key={k}
                className={cn(
                  "flex min-h-[6.5rem] flex-col justify-between rounded-lg border p-3.5",
                  items.length ? "border-white/25 bg-white/[0.05]" : "border-dashed border-white/12",
                )}
              >
                <span className="label-sm text-mist">{k}</span>
                {items.length ? (
                  <ul className="flex flex-col gap-1 text-[0.8rem] text-paper">
                    {items.map((m) => (
                      <li key={m.title}>{m.href ? <a href={m.href} className="underline underline-offset-2">{m.title}</a> : m.title}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="label-sm text-ash">Sealed</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="label-sm mt-6 text-ash">
          {total > 0
            ? `${total} verified memories in this capsule.`
            : "This capsule is sealed until the founder adds real photos, documents, projects and lessons. Nothing here is invented."}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function TheBuild() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 900px)", true);
  const [extra, setExtra] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  // The section is exactly as tall as the horizontal journey is long.
  useIsoLayoutEffect(() => {
    if (!desktop) return;
    const measure = () => {
      const t = trackRef.current;
      if (t) setExtra(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [desktop]);

  useEffect(() => {
    if (!desktop || !extra) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: sectionRef.current, start: "top top", end: "bottom bottom", scrub: 0.8 };
      gsap.to(trackRef.current, { x: -extra, ease: "none", scrollTrigger: { ...st } });
      gsap.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { ...st } });
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [desktop, extra]);

  const Intro = (
    <div className="flex w-[min(80vw,34rem)] shrink-0 flex-col justify-center pr-16">
      <Coordinates code="14 / Journey" items={["The Build", "12 chapters"]} />
      <h2 id="the-build-title" className="display mt-8 text-[clamp(3.6rem,9vw,9rem)] text-paper">
        The Build
      </h2>
      <p className="editorial mt-4 text-[clamp(1.3rem,2vw,1.8rem)] italic text-mist">Not a résumé. A journey — and every chapter holds a memory capsule.</p>
      {desktop && (
        <p className="label-sm mt-10 flex items-center gap-2 text-ash">
          Scroll to travel <ArrowRight className="h-3 w-3" aria-hidden />
        </p>
      )}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="the-build"
      data-hud
      aria-labelledby="the-build-title"
      className="relative bg-graphite-950"
      style={desktop ? { height: `calc(100svh + ${extra}px)` } : undefined}
    >
      {desktop ? (
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-x-0 top-[64%] h-px bg-white/10" />
          <div ref={trackRef} className="gutter relative flex h-full w-max items-stretch will-change-transform">
            {Intro}
            {chapters.map((c, i) => (
              <article key={c.id} className="group relative h-full w-[clamp(22rem,32vw,30rem)] shrink-0">
                <span
                  aria-hidden
                  className="display pointer-events-none absolute left-0 top-[14%] select-none text-[clamp(8rem,15vw,14rem)] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.1)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute bottom-[calc(36%+1.75rem)] left-0 right-10 flex flex-col gap-3">
                  <span className="label-sm text-ash">{c.period ?? `Chapter ${String(i + 1).padStart(2, "0")}`}</span>
                  <h3 className="display text-balance text-[clamp(1.8rem,2.7vw,2.7rem)] text-paper">{c.title}</h3>
                </div>
                <span
                  aria-hidden
                  className="absolute left-0 top-[64%] -mt-[5px] h-[11px] w-[11px] rounded-full border border-white/50 bg-graphite-950 transition-colors group-hover:bg-paper"
                />
                <div className="absolute left-0 right-10 top-[calc(64%+1.75rem)] flex flex-col gap-4">
                  {c.worlds.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {c.worlds.slice(0, 4).map((id) => (
                        <li key={id} className="flex items-center gap-1.5 text-[0.8rem] text-mist">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: worldById[id].accent }} />
                          {worldById[id].name}
                        </li>
                      ))}
                      {c.worlds.length > 4 && <li className="text-[0.8rem] text-ash">+{c.worlds.length - 4} more</li>}
                    </ul>
                  )}
                  {c.note && <p className="editorial text-[1.2rem] italic text-platinum">{c.note}</p>}
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    className="label-sm flex w-max items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-mist transition-colors hover:border-white/50 hover:bg-paper hover:text-ink"
                  >
                    <Archive className="h-3.5 w-3.5" aria-hidden /> Open memory capsule
                  </button>
                </div>
              </article>
            ))}
            <div className="flex w-[40vw] shrink-0 items-center">
              <p className="editorial text-[clamp(2rem,4vw,3.6rem)] italic text-mist">To be continued —</p>
            </div>
          </div>
          <div className="gutter absolute inset-x-0 bottom-8">
            <div className="h-px w-full bg-white/10">
              <div ref={barRef} className="h-px w-full origin-left bg-paper" />
            </div>
          </div>
        </div>
      ) : (
        <div className="gutter pb-24 pt-[calc(var(--hud-h)+2.5rem)]">
          {Intro}
          <ol className="relative mt-12 border-l border-white/15 pl-6">
            {chapters.map((c, i) => (
              <li key={c.id} className="relative pb-10">
                <span aria-hidden className="absolute -left-[30px] top-2 h-[11px] w-[11px] rounded-full border border-white/50 bg-graphite-950" />
                <span className="label-sm text-ash">{c.period ?? `Chapter ${String(i + 1).padStart(2, "0")}`}</span>
                <h3 className="display mt-2 text-[2.2rem] text-paper">{c.title}</h3>
                {c.note && <p className="editorial mt-2 text-[1.15rem] italic text-platinum">{c.note}</p>}
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="label-sm mt-4 flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-mist"
                >
                  <Archive className="h-3.5 w-3.5" aria-hidden /> Open memory capsule
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <AnimatePresence>
        {open !== null && <CapsuleDialog key={open} chapter={chapters[open]} index={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
