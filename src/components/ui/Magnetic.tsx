"use client";

import { forwardRef, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticProps = React.ComponentPropsWithoutRef<"button"> & {
  strength?: number;
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
};

/**
 * A control that leans toward the pointer: it tells the visitor
 * "this is the way forward" before they click.
 */
export const Magnetic = forwardRef<HTMLElement, MagneticProps>(function Magnetic(
  { strength = 0.35, className, children, as = "button", onPointerMove, onPointerLeave, ...rest },
  forwardedRef,
) {
  const reduced = useReducedMotion();
  const localRef = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const setRef = (el: HTMLElement | null) => {
    localRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  const handleMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== "mouse" || !localRef.current) return;
    const r = localRef.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const shared = {
    ref: setRef,
    className: cn("relative inline-flex items-center justify-center", className),
    style: { x: sx, y: sy },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      handleMove(e);
      onPointerMove?.(e as React.PointerEvent<HTMLButtonElement>);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      handleLeave();
      onPointerLeave?.(e as React.PointerEvent<HTMLButtonElement>);
    },
  };

  if (as === "a") {
    const { href, target, rel, ...anchorRest } = rest as { href?: string; target?: string; rel?: string };
    return (
      <motion.a
        {...shared}
        href={href}
        target={target}
        rel={rel}
        {...(anchorRest as React.ComponentPropsWithoutRef<typeof motion.a>)}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" {...shared} {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}>
      {children}
    </motion.button>
  );
});
