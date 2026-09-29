"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useExperience } from "@/components/providers/Experience";
import { sections } from "@/content/sections";
import { cn, scrollToId } from "@/lib/utils";

/** ⌘K — spatial navigation for the whole universe. */
export function CommandPalette({ open, onClose, activeId }: { open: boolean; onClose: () => void; activeId: string }) {
  return <AnimatePresence>{open && <PaletteBody key="palette" onClose={onClose} activeId={activeId} />}</AnimatePresence>;
}

function PaletteBody({ onClose, activeId }: { onClose: () => void; activeId: string }) {
  const { phase, setPhase } = useExperience();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(() => Math.max(0, sections.findIndex((s) => s.id === activeId)));
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => `${s.code} ${s.title} ${s.group} ${s.hint}`.toLowerCase().includes(q));
  }, [query]);

  const travelled = useRef(false);

  // Hold the page still while the launcher is open; restore focus if the visitor cancels.
  useEffect(() => {
    const returnFocus = document.activeElement as HTMLElement | null;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    requestAnimationFrame(() => inputRef.current?.focus());
    lenis?.stop();
    return () => {
      if (document.documentElement.dataset.genesis !== "playing") lenis?.start();
      if (!travelled.current) returnFocus?.focus?.({ preventScroll: true });
    };
  }, []);

  const go = (id: string) => {
    travelled.current = true;
    onClose();
    if (phase !== "entered") setPhase("entered");
    requestAnimationFrame(() => scrollToId(id));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      go(results[cursor].id);
    } else if (e.key === "Tab") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-obsidian/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigate the universe"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass w-full max-w-2xl overflow-hidden rounded-2xl bg-graphite-900/80 shadow-2xl shadow-black/60"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search className="h-4 w-4 text-ash" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                placeholder="Where to? Worlds, journey, lab…"
                className="flex-1 bg-transparent text-[1.05rem] text-paper placeholder:text-ash focus:outline-none"
                aria-label="Search sections"
                aria-controls="palette-results"
                aria-activedescendant={results[cursor] ? `palette-${results[cursor].id}` : undefined}
              />
              <kbd className="label-sm rounded border border-white/15 px-1.5 py-1 text-ash">Esc</kbd>
            </div>
            <ul id="palette-results" role="listbox" className="max-h-[56vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <li className="label px-4 py-6 text-ash">Nothing here — yet.</li>}
              {results.map((s, i) => (
                <li key={s.id} id={`palette-${s.id}`} role="option" aria-selected={i === cursor}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(s.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors",
                      i === cursor ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="label-sm w-6 tabular-nums text-ash">{s.code}</span>
                    <span className="flex-1">
                      <span className="block text-[0.98rem] text-paper">{s.title}</span>
                      <span className="label-sm text-ash">{s.hint}</span>
                    </span>
                    <span className="label-sm hidden text-ash sm:inline">{s.group}</span>
                    {s.id === activeId && <span className="label-sm text-paper">Here</span>}
                    {i === cursor && <CornerDownLeft className="h-3.5 w-3.5 text-ash" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="label-sm flex items-center justify-between border-t border-white/10 px-5 py-3 text-ash">
              <span>↑↓ move · ↵ travel</span>
              <span>⌘K or / to open</span>
            </div>
          </motion.div>
        </motion.div>
  );
}
