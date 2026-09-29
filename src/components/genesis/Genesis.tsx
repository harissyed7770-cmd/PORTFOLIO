"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { useExperience } from "@/components/providers/Experience";
import { Magnetic } from "@/components/ui/Magnetic";
import { person } from "@/content/ecosystem";
import { sampleElementsToPoints } from "@/lib/textPoints";
import { cn, scrollToId } from "@/lib/utils";
import { useDeviceTier, useViewportAspect } from "@/hooks/useClient";
import {
  constellationPosition,
  constellations,
  finalGenesisState,
  initialGenesisState,
  revealOrder,
  type GenesisState,
  type GenesisTargets,
} from "./model";
import type { GenesisQuality } from "./GenesisScene";

const GenesisScene = dynamic(() => import("./GenesisScene"), { ssr: false });

const bootLog = ["A point of light", "Expansion", "Connections form", "Identity resolves", "The network", "Ready"];

export function Genesis() {
  const { phase, setPhase, enter, reducedMotion, genesisRun, enterSignal } = useExperience();
  const rootRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<GenesisState>(initialGenesisState());
  const targetsRef = useRef<GenesisTargets>({ text: null, version: 0 });
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(true);
  const [logIndex, setLogIndex] = useState(-1);
  const tier = useDeviceTier();
  const aspect = useViewportAspect();

  // Device-aware budget: fewer particles on small or low-power devices.
  const quality = useMemo<GenesisQuality | null>(() => {
    if (tier === "ssr") return null;
    if (tier === "small") return { particles: 4200, field: 45000, hubs: 520 };
    if (tier === "low") return { particles: 5200, field: 80000, hubs: 1100 };
    return { particles: 7200, field: 160000, hubs: 1100 };
  }, [tier]);

  // Pause the scene once it scrolls out of view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Sample the real typography so particles converge exactly onto the name.
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || !firstRef.current || !lastRef.current || !quality) return;
    const text = sampleElementsToPoints([firstRef.current, lastRef.current], root.getBoundingClientRect(), quality.particles);
    targetsRef.current = { text, version: targetsRef.current.version + 1 };
  }, [quality]);

  useEffect(() => {
    if (!quality) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (document.fonts?.ready ?? Promise.resolve()).then(() => !cancelled && measure());
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 180);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [quality, measure]);

  // The sequence.
  useEffect(() => {
    if (phase === "entered" && !tlRef.current) {
      Object.assign(stateRef.current, finalGenesisState());
      setLogIndex(bootLog.length - 1);
      return;
    }
    if (phase !== "playing" || !rootRef.current) return;
    tlRef.current?.kill();
    const q = gsap.utils.selector(rootRef);
    const s = stateRef.current;
    Object.assign(s, initialGenesisState());
    setLogIndex(-1);
    gsap.set(q("[data-g-final]"), { opacity: 0 });
    gsap.set(q("h1[data-g=name]"), { opacity: 0.02 });
    gsap.set(q("[data-g=tagline]"), { y: 14 });
    gsap.set(q("[data-g=word]"), { opacity: 0 });
    gsap.set(q("[data-g=spark]"), { opacity: 0, scale: 0.2 });
    const counter = { v: 0 };
    const writeCounter = () => {
      if (counterRef.current) counterRef.current.textContent = `${Math.round(counter.v).toLocaleString("en-US")}+`;
    };

    const tl = gsap.timeline({ onComplete: () => setPhase("ready") });
    tl.call(() => setLogIndex(0), [], 0.5)
      .to(q("[data-g=spark]"), { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 0.5)
      .call(() => setLogIndex(1), [], 2.2)
      .to(s, { morph: 1, duration: 2.2, ease: "expo.inOut" }, 2.2)
      .to(q("[data-g=spark]"), { opacity: 0, scale: 3.2, duration: 1.2, ease: "power2.in" }, 2.3)
      .call(() => setLogIndex(2), [], 4.4)
      .to(s, { morph: 2, duration: 2.4, ease: "power3.inOut" }, 4.4)
      .to(s, { lines: 1, duration: 1.4, ease: "power2.out" }, 5.8);
    revealOrder.forEach((word, i) => {
      tl.to(q(`[data-word="${word}"]`), { opacity: 1, duration: 0.8, ease: "power2.out" }, 5.7 + i * 0.2);
    });
    tl.to(q("[data-g=word]"), { opacity: 0, duration: 0.7, ease: "power2.in" }, 8.8)
      .to(s, { lines: 0, duration: 0.8 }, 8.8)
      .call(() => setLogIndex(3), [], 9.0)
      .to(s, { morph: 3, duration: 2.4, ease: "expo.inOut" }, 9.0)
      .to(q("[data-g=tagline]"), { opacity: 1, y: 0, duration: 1.3, ease: "power3.out" }, 11.1)
      .to(q("[data-g=positioning]"), { opacity: 1, duration: 1.4, ease: "power2.out" }, 11.4)
      .call(() => setLogIndex(4), [], 12.4)
      .to(s, { morph: 4, duration: 3.2, ease: "expo.inOut" }, 12.4)
      .to(q("[data-g=name]"), { opacity: 1, duration: 1.1, ease: "power2.out" }, 12.45)
      .to(s, { field: 1, netLines: 1, duration: 2.8, ease: "power2.inOut" }, 13.2)
      .to(q("[data-g=audience]"), { opacity: 1, duration: 1.0 }, 13.6)
      .fromTo(counter, { v: 0 }, { v: person.audience.value, duration: 2.4, ease: "expo.out", onUpdate: writeCounter }, 13.6)
      .call(() => setLogIndex(5), [], 15.4)
      .to(q("[data-g=enter]"), { opacity: 1, duration: 1.0, ease: "power2.out" }, 15.4);
    tlRef.current = tl;
  }, [phase, genesisRun, setPhase]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
      tlRef.current = null;
    },
    [],
  );

  const skip = useCallback(() => {
    tlRef.current?.progress(1);
  }, []);

  // Esc skips the sequence; once ready, any forward gesture enters.
  useEffect(() => {
    if (phase !== "playing" && phase !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (phase === "playing" && e.key === "Escape") skip();
      if (phase === "ready" && ["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        enter();
      }
    };
    let touchY = 0;
    const onWheel = (e: WheelEvent) => {
      if (phase === "ready" && e.deltaY > 12) enter();
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? 0);
    const onTouchMove = (e: TouchEvent) => {
      if (phase === "ready" && touchY - (e.touches[0]?.clientY ?? 0) > 40) enter();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [phase, enter, skip]);

  // Entering: the camera travels into the network while the page moves on.
  useEffect(() => {
    if (enterSignal === 0) return;
    const s = stateRef.current;
    if (!reducedMotion) {
      gsap.to(s, {
        warp: 1,
        duration: 1.5,
        ease: "power3.in",
        onComplete: () => {
          gsap.to(s, { warp: 0, duration: 0.01, delay: 1.4 });
        },
      });
    }
    const t = setTimeout(() => scrollToId("not-one-company"), reducedMotion ? 0 : 320);
    return () => clearTimeout(t);
  }, [enterSignal, reducedMotion]);

  const playing = phase === "playing";
  const ready = phase === "ready";

  return (
    <section
      ref={rootRef}
      id="genesis"
      data-hud
      aria-label="Genesis — Haris Afnan"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-obsidian"
    >
      {quality && <GenesisScene stateRef={stateRef} targetsRef={targetsRef} quality={quality} active={active} />}

      <div aria-hidden className="pointer-events-none absolute inset-0 vignette" />
      <div
        aria-hidden
        data-g="name"
        data-g-final
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(6,7,10,0.72), transparent 75%)" }}
      />

      {/* The single point of light. */}
      <div
        aria-hidden
        data-g="spark"
        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, #fff 0%, #fff 30%, rgba(255,255,255,0) 70%)",
          boxShadow: "0 0 30px 8px rgba(255,255,255,0.35), 0 0 120px 40px rgba(220,225,235,0.08)",
        }}
      />

      {/* Constellation words. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {constellations.map((c, i) => {
          const p = constellationPosition(i, aspect);
          return (
            <span
              key={c.word}
              data-g="word"
              data-word={c.word}
              className="label absolute whitespace-nowrap text-platinum opacity-0"
              style={{
                left: `${50 + p.x * 100}%`,
                top: `${50 - p.y * 100}%`,
                transform: `translate(-50%, ${i === 0 ? "2.6rem" : "1.6rem"})`,
                textShadow: "0 0 18px rgba(0,0,0,0.9)",
              }}
            >
              {c.word}
            </span>
          );
        })}
      </div>

      <p className="sr-only">
        An opening sequence: a single point of light becomes thousands of particles. They connect into eight constellations —
        AI, business, education, media, real estate, social impact, technology and people — and converge into the name{" "}
        {person.name}, then open into a network representing {person.audience.display} {person.audience.platform} {person.audience.unit}.
      </p>

      {/* Final composition. */}
      <div className="gutter pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p data-g="positioning" data-g-final className="label mb-6 max-w-[64rem] text-balance text-mist md:mb-9">
          {person.positioning.join("  ·  ")}
        </p>
        <h1
          data-g="name"
          data-g-final
          className="display text-[min(22vw,19vh)] text-paper [text-shadow:0_0_60px_rgba(0,0,0,0.6)] sm:text-[min(15.5vw,21vh)]"
        >
          <span ref={firstRef} className="block sm:inline">
            {person.firstName}
          </span>
          <span className="hidden sm:inline"> </span>
          <span ref={lastRef} className="block sm:inline">
            {person.lastName}
          </span>
        </h1>
        <p
          data-g="tagline"
          data-g-final
          className="editorial mt-5 text-[clamp(1.35rem,2.6vw,2.25rem)] italic text-platinum md:mt-7"
        >
          {person.tagline}
        </p>
        <div data-g="audience" data-g-final className="mt-9 flex flex-col items-center gap-2 md:mt-12">
          <span ref={counterRef} className="display-wide text-[clamp(1.6rem,3.4vw,2.8rem)] tabular-nums metallic">
            {person.audience.display}
          </span>
          <span className="label text-ash">
            {person.audience.platform} {person.audience.unit} · a network of people
          </span>
        </div>
        <div data-g="enter" data-g-final className="pointer-events-auto mt-10 md:mt-12">
          <Magnetic
            onClick={enter}
            className="group gap-4 rounded-full border border-white/20 bg-white/[0.04] px-7 py-4 backdrop-blur-md transition-colors duration-500 hover:border-white/50 hover:bg-white hover:text-ink"
          >
            <span className="label text-[0.72rem]">{phase === "entered" ? "Explore the ecosystem" : "Enter the ecosystem"}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
          </Magnetic>
        </div>
      </div>

      {/* Boot log + controls. */}
      <div className="gutter pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 md:pb-8">
        <ol aria-hidden className="hidden flex-col gap-1.5 sm:flex">
          {bootLog.map((line, i) => (
            <li
              key={line}
              className={cn(
                "label-sm flex items-center gap-3 transition-all duration-700",
                i === logIndex ? "text-paper" : i < logIndex ? "text-ash/60" : "text-transparent",
              )}
            >
              <span className="tabular-nums">{String(i).padStart(2, "0")}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-1 justify-end">
          {playing && (
            <button
              type="button"
              onClick={skip}
              className="label-sm pointer-events-auto rounded-full border border-white/15 px-4 py-2.5 text-mist transition-colors hover:border-white/40 hover:text-paper"
            >
              Skip intro <span className="text-ash">· Esc</span>
            </button>
          )}
          {ready && <span className="label-sm text-ash">Scroll or press ↓ to enter</span>}
        </div>
      </div>
    </section>
  );
}
