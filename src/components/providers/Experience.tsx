"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useClientSnapshot, useMediaQuery } from "@/hooks/useClient";

/**
 * boot     – server render / before hydration
 * playing  – the genesis sequence is running; the page is held still
 * ready    – genesis finished; waiting for the visitor to enter
 * entered  – the universe is open
 */
export type GenesisPhase = "boot" | "playing" | "ready" | "entered";

interface ExperienceState {
  phase: GenesisPhase;
  setPhase: (p: GenesisPhase) => void;
  enter: () => void;
  replay: () => void;
  reducedMotion: boolean;
  /** Increments each time the genesis sequence is (re)started. */
  genesisRun: number;
  /** Increments when the visitor enters — used to trigger the warp. */
  enterSignal: number;
}

const ExperienceContext = createContext<ExperienceState | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return ctx;
}

type LenisWindow = Window & { __lenis?: Lenis };

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  // The pre-paint head script already decided whether genesis plays.
  const bootPhase = useClientSnapshot<GenesisPhase>(
    () => (document.documentElement.dataset.genesis === "playing" ? "playing" : "entered"),
    "boot",
  );
  const [override, setOverride] = useState<GenesisPhase | null>(null);
  const phase = override ?? bootPhase;
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [genesisRun, setGenesisRun] = useState(0);
  const [enterSignal, setEnterSignal] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scrolling (disabled when the visitor prefers reduced motion).
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    (window as LenisWindow).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (document.documentElement.dataset.genesis === "playing") lenis.stop();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as LenisWindow).__lenis;
    };
  }, [reducedMotion]);

  const setPhase = useCallback((p: GenesisPhase) => {
    setOverride(p);
    const html = document.documentElement;
    if (p === "playing" || p === "ready") {
      html.dataset.genesis = "playing";
      lenisRef.current?.stop();
    } else if (p === "entered") {
      html.dataset.genesis = "entered";
      lenisRef.current?.start();
      try {
        sessionStorage.setItem("ha:entered", "1");
      } catch {
        /* storage unavailable — fine */
      }
    }
  }, []);

  const enter = useCallback(() => {
    setPhase("entered");
    setEnterSignal((n) => n + 1);
  }, [setPhase]);

  const replay = useCallback(() => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0 });
    history.replaceState(null, "", window.location.pathname);
    setGenesisRun((n) => n + 1);
    setPhase("playing");
  }, [setPhase]);

  // Refresh scroll-driven measurements once fonts are in.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const value = useMemo(
    () => ({ phase, setPhase, enter, replay, reducedMotion, genesisRun, enterSignal }),
    [phase, setPhase, enter, replay, reducedMotion, genesisRun, enterSignal],
  );

  return (
    <ExperienceContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ExperienceContext.Provider>
  );
}
