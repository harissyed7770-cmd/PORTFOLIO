"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useTransform } from "framer-motion";
import { person } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { Coordinates, useSectionProgress, useVisible } from "@/components/ui/primitives";
import { useDeviceTier } from "@/hooks/useClient";

const MillionScene = dynamic(() => import("./MillionScene"), { ssr: false });

const words = ["People.", "Ideas.", "Conversations.", "Opportunities."];

function Word({ word, index, progress }: { word: string; index: number; progress: ReturnType<typeof useSectionProgress> }) {
  const start = 0.2 + index * 0.06;
  const opacity = useTransform(progress, [start, start + 0.04, 0.5, 0.56], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.05], [24, 0]);
  return (
    <motion.span style={{ opacity, y }} className="block">
      {word}
    </motion.span>
  );
}

export function MillionNetwork() {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const [stageRef, visible] = useVisible<HTMLDivElement>("300px");
  const tier = useDeviceTier();
  const count = tier === "ssr" ? null : tier === "small" ? 250_000 : tier === "low" ? 500_000 : 1_000_000;

  const numberOpacity = useTransform(p, [0, 0.06, 0.16, 0.22], [0, 1, 1, 0.08]);
  const numberScale = useTransform(p, [0, 0.22], [0.92, 1.08]);
  const clusterCaption = useTransform(p, [0.66, 0.74], [0, 1]);
  const ratio = count ? Math.round(person.audience.value / count) : 1;

  return (
    <section ref={ref} id="network" data-hud aria-labelledby="network-title" className="relative h-[420vh] bg-obsidian">
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        {count && <MillionScene count={count} progress={p} active={visible} reduced={reducedMotion} />}
        <div aria-hidden className="pointer-events-none absolute inset-0 vignette" />

        <div className="gutter pointer-events-none absolute inset-x-0 top-[calc(var(--hud-h)+1.5rem)]">
          <Coordinates code="13 / Network" items={["The one million network", "Scale of human connection"]} className="max-w-xl" />
        </div>

        <motion.div
          style={{ opacity: numberOpacity, scale: numberScale }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <h2 id="network-title" className="display-wide text-[clamp(3.6rem,14vw,15rem)] tabular-nums metallic">
            {person.audience.display}
          </h2>
          <p className="label mt-4 text-mist">
            {person.audience.platform} {person.audience.unit}
          </p>
        </motion.div>

        <div className="gutter pointer-events-none absolute inset-0 flex items-center">
          <p className="display text-[clamp(2.6rem,7.5vw,7.5rem)] text-paper [text-shadow:0_0_40px_rgba(0,0,0,0.8)]">
            {words.map((w, i) => (
              <Word key={w} word={w} index={i} progress={p} />
            ))}
          </p>
        </div>

        <motion.div
          style={{ opacity: clusterCaption }}
          className="gutter pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent pb-8 pt-16 md:flex-row md:items-end md:justify-between md:bg-none"
        >
          <p className="editorial max-w-md text-[clamp(1.2rem,1.8vw,1.6rem)] italic text-platinum">
            Not an audience. A network of people.
          </p>
          <div className="flex flex-col gap-1 md:items-end">
            <p className="label-sm text-mist">
              {count
                ? ratio === 1
                  ? `Rendering ${count.toLocaleString("en-US")} points · one for every follower`
                  : `Rendering ${count.toLocaleString("en-US")} points on this device · each stands for ${ratio} followers`
                : " "}
            </p>
            <p className="label-sm text-ash">Clusters illustrate kinds of people in a network — they are not audience data.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
