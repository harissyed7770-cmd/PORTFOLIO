"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration-safe readers for browser state. Each returns the server value
 * during SSR/hydration and the live browser value afterwards, without
 * setState-in-effect round trips.
 */

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const subscribeResize = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};

/** Viewport aspect ratio (width / height), rounded so snapshots stay stable. */
export function useViewportAspect(serverValue = 1.6) {
  return useSyncExternalStore(
    subscribeResize,
    () => Math.round((window.innerWidth / Math.max(1, window.innerHeight)) * 100) / 100,
    () => serverValue,
  );
}

export type DeviceTier = "ssr" | "small" | "low" | "high";

/** A coarse performance budget: small screens and low core counts get lighter scenes. */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    subscribeResize,
    () => {
      if (window.innerWidth < 768) return "small";
      return (navigator.hardwareConcurrency ?? 8) <= 4 ? "low" : "high";
    },
    () => "ssr",
  );
}

const subscribeSecond = (onChange: () => void) => {
  const t = setInterval(onChange, 1000);
  return () => clearInterval(t);
};

/** Current time in whole seconds (0 on the server). */
export function useNowSeconds() {
  return useSyncExternalStore(
    subscribeSecond,
    () => Math.floor(Date.now() / 1000),
    () => 0,
  );
}

const noopSubscribe = () => () => {};

/** Reads a value from the DOM once on the client; `serverValue` during SSR. */
export function useClientSnapshot<T extends string | number | boolean>(read: () => T, serverValue: T) {
  return useSyncExternalStore(noopSubscribe, read, () => serverValue);
}
