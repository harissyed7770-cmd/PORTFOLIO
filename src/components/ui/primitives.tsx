"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Scroll progress through a tall section: 0 when its top meets the viewport top, 1 when its bottom meets the viewport bottom. */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return scrollYProgress;
}

/** Subscribe to a motion value as React state, throttled to animation frames. */
export function useMotionNumber(mv: MotionValue<number>, precision = 1000) {
  const [v, setV] = useState(() => mv.get());
  useEffect(() => {
    let raf = 0;
    const unsub = mv.on("change", (latest) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setV(Math.round(latest * precision) / precision));
    });
    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, [mv, precision]);
  return v;
}

/** Mounts children only once the placeholder approaches the viewport. */
export function LazyMount({
  children,
  className,
  margin = "600px",
  fallback = null,
}: {
  children: React.ReactNode;
  className?: string;
  margin?: string;
  fallback?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: margin as `${number}px` });
  return (
    <div ref={ref} className={className}>
      {near ? children : fallback}
    </div>
  );
}

/** Returns whether the element is currently visible (for pausing animation loops). */
export function useVisible<T extends HTMLElement>(margin = "120px") {
  const ref = useRef<T>(null);
  const visible = useInView(ref, { margin: margin as `${number}px` });
  return [ref, visible] as const;
}

/** Coordinates line shown at the top of every world: the Founder OS chrome. */
export function Coordinates({
  code,
  items,
  className,
  tone = "dark",
}: {
  code: string;
  items: string[];
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "label-sm flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-4",
        tone === "dark" ? "border-white/10 text-ash" : "border-ink/15 text-ink/60",
        className,
      )}
    >
      <span className={tone === "dark" ? "text-paper" : "text-ink"}>{code}</span>
      {items.map((it) => (
        <span key={it} className="flex items-center gap-4">
          <span aria-hidden className={cn("h-px w-6", tone === "dark" ? "bg-white/20" : "bg-ink/25")} />
          {it}
        </span>
      ))}
    </div>
  );
}

/**
 * An open slot. The universe publishes verified information only; anything not
 * yet supplied renders as an honest, designed absence instead of filler.
 */
export function OpenSlot({
  label,
  note = "Awaiting verified record",
  tone = "dark",
  className,
  compact = false,
}: {
  label: string;
  note?: string;
  tone?: "dark" | "light";
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between border border-dashed",
        compact ? "gap-2 p-3" : "gap-6 p-5",
        tone === "dark" ? "border-white/15 text-mist" : "border-ink/20 text-ink/70",
        className,
      )}
    >
      <span className="label-sm">{label}</span>
      <span className={cn("label-sm flex items-center gap-2", tone === "dark" ? "text-ash" : "text-ink/50")}>
        <span aria-hidden className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-current" />
        {note}
      </span>
    </div>
  );
}

/** Words that rise into place as they enter the viewport. */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.05,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const words = text.split(" ");
  return (
    <Tag ref={ref as React.Ref<never>} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "105%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Fades & lifts its children once in view. */
export function Rise({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group label inline-flex items-center gap-2 border-b border-current pb-1 transition-opacity hover:opacity-70",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}
