"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Command } from "lucide-react";
import { useExperience } from "@/components/providers/Experience";
import { sectionById, sections } from "@/content/sections";
import { scrollToId } from "@/lib/utils";
import { CommandPalette } from "./CommandPalette";

/**
 * The Founder OS chrome: where you are, how far you've travelled,
 * and a launcher to jump anywhere in the universe.
 */
export function Hud() {
  const { phase } = useExperience();
  const [active, setActive] = useState(sections[0].id);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-hud]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = sectionById[active] ?? sections[0];
  const visible = phase === "entered";

  return (
    <>
      <a
        href="#not-one-company"
        className="sr-only-focusable label fixed left-4 top-4 z-[80] rounded bg-paper px-4 py-3 text-ink"
      >
        Skip to content
      </a>

      <AnimatePresence>
        {visible && (
          <motion.header
            key="hud"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="gutter pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-[var(--hud-h)] items-center justify-between text-white mix-blend-difference"
          >
            <button
              type="button"
              onClick={() => scrollToId("genesis")}
              className="pointer-events-auto flex items-center gap-3"
              aria-label="Back to the beginning"
            >
              <span className="display text-[1.05rem] tracking-[-0.06em]">HA</span>
              <span className="label-sm hidden opacity-60 md:inline">Founder OS</span>
            </button>

            <div className="label-sm absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex" aria-live="polite">
              <span className="tabular-nums opacity-60">{current.code}</span>
              <span aria-hidden className="h-px w-8 bg-white/40" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  {current.title}
                </motion.span>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="label-sm pointer-events-auto flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-2 transition-colors hover:bg-white hover:text-black"
              aria-haspopup="dialog"
              aria-expanded={paletteOpen}
            >
              <Command className="h-3 w-3" aria-hidden />
              <span>Navigate</span>
              <span className="hidden tabular-nums opacity-60 sm:inline">{current.code}/20</span>
            </button>
          </motion.header>
        )}
      </AnimatePresence>

      {visible && (
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[61] h-px origin-left bg-white mix-blend-difference"
          style={{ scaleX: progress }}
        />
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} activeId={active} />
    </>
  );
}
