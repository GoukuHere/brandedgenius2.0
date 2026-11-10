"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
  v11's counting figures (the developer: "add loader animation on number text from zero"). Every number in a figure
  runs from 0 to its value at once, both ends of a range ("40–70 %" from "0–0 %"), and the signs and units stay
  where they are. The final figure is laid out invisibly in the same cell, so nothing around it moves while the
  digits grow. Screen readers get the figure itself, never the counting. Reduced motion: the figure as it is.
*/

const EASE = [0.16, 1, 0.3, 1] as const;

// Layout effects only run in the browser; on the server the plain effect is a no-op stand-in.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Part = string | number;

/** "−84%" → ["−", 84, "%"], "40–70 %" → [40, "–", 70, " %"]. */
function split(value: string): Part[] {
  return value
    .split(/(\d+)/)
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

const shown = (parts: Part[], t: number) => parts.map((part) => (typeof part === "number" ? String(Math.round(part * t)) : part)).join("");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A figure that counts up from zero. It runs when `play` turns true, and again whenever `value` changes while it
 * plays; without `play` it runs once when it comes into view. While it is not playing it rests at zero.
 */
export function CountUp({
  value,
  play,
  duration = 1.4,
  delay = 0,
  className,
}: {
  value: string;
  play?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const live = useRef<HTMLSpanElement>(null);
  const seen = useInView(box, { once: true, margin: "0px 0px -12% 0px" });
  const run = play ?? seen;

  // Before the first paint: the figure rests at zero until it runs.
  useBrowserLayoutEffect(() => {
    const el = live.current;
    const parts = split(value);
    if (!el || !parts.some((part) => typeof part === "number") || reducedMotion()) return;
    if (!run) el.textContent = shown(parts, 0);
  }, [value, run]);

  useEffect(() => {
    const el = live.current;
    const parts = split(value);
    if (!el || !run) return undefined;
    if (!parts.some((part) => typeof part === "number") || reducedMotion()) {
      el.textContent = value;
      return undefined;
    }
    el.textContent = shown(parts, 0);
    const controls = animate(0, 1, {
      duration,
      delay,
      ease: EASE,
      onUpdate: (t) => {
        el.textContent = shown(parts, t);
      },
    });
    return () => controls.stop();
  }, [value, run, duration, delay]);

  return (
    <span ref={box} className={cn("inline-grid", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      {/* Keyed by the figure, so React never writes into a text node that the counter has replaced. */}
      <span key={value} ref={live} aria-hidden className="col-start-1 row-start-1">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

/** A word without a number ("Nachhaltig"): its letters rise into place one after another when `play` turns true. */
export function RiseLetters({ text, play, className }: { text: string; play: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex overflow-hidden pb-[0.08em]", className)}>
      <span className="sr-only">{text}</span>
      {Array.from(text).map((letter, i) => (
        <motion.span
          key={`${letter}${i}`}
          aria-hidden
          initial={false}
          animate={play ? { y: "0%", opacity: 1 } : { y: "105%", opacity: 0 }}
          transition={{ duration: 0.7, delay: play ? 0.12 + i * 0.045 : 0, ease: EASE }}
          className="inline-block whitespace-pre motion-reduce:!transform-none motion-reduce:!opacity-100"
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}
