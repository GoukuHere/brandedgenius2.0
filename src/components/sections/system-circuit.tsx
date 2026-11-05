import { useSyncExternalStore } from "react";

/*
  The circuit language shared by two sections that tell one story. Problem draws it BROKEN: the main trace stops
  short of every junction and each loose end is an open ring. System, later on the page, draws the SAME circuit
  COMPLETED: every trace reaches its card and every contact is a filled dot. One sky colour, one 1px line weight
  and one dot size in both, so the second reads as the first one repaired.
*/

export const SKY = "#69bff8";
export const ICE = "#dcecff";
export const ROYAL = "#004ba0";

/** Every trace is a 1px line. */
export const LINE = 1;
/** Dot radius. System's filled dots are 6px across; Problem's rings are 7px (the same radius plus the 1px stroke). */
export const DOT_R = 3;
/** From a ring's centre to the outer edge of its stroke: where a line touches a ring. */
export const RING_EDGE = DOT_R + LINE / 2;

/** Scroll smoothing for both diagrams: overdamped (no overshoot), and the first jump on a reload is not animated. */
export const SCROLL_SPRING = { stiffness: 110, damping: 26, mass: 0.5, restDelta: 0.0005, skipInitialAnimation: true };

/** 0 up to a, 1 from b, linear in between. */
export function ramp(value: number, a: number, b: number) {
  if (value <= a) return 0;
  if (value >= b) return 1;
  return (value - a) / (b - a);
}

export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

/** Puts a coordinate on a half pixel, so a 1px line along it covers exactly one pixel row or column. */
export const snap = (value: number) => Math.round(value - 0.5) + 0.5;

/*
  Media state through useSyncExternalStore with a server value of false (tab visibility: true), so the server
  markup and the hydration render always match; the real value arrives in the render right after hydration.
*/
function mediaStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const LG = mediaStore("(min-width: 64rem)");
const REDUCE = mediaStore("(prefers-reduced-motion: reduce)");
const serverFalse = () => false;
const serverTrue = () => true;

/** True from the lg breakpoint (1024px), where both diagrams are drawn. */
export const useLg = () => useSyncExternalStore(LG.subscribe, LG.get, serverFalse);
/** True when the visitor asks for reduced motion. */
export const useReducedMotionPref = () => useSyncExternalStore(REDUCE.subscribe, REDUCE.get, serverFalse);

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
/** False while the browser tab is hidden. */
export const useTabVisible = () => useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", serverTrue);
