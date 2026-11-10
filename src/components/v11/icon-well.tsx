"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentType, type RefAttributes } from "react";
import { cn } from "@/lib/utils";
import { ANIMATED_ICONS, type AnimatedIconHandle, type IconName } from "./icons";

/*
  v11's icons (the developer: "the icons don't look good, add some animated icons"): a sky line icon in a small
  glass well with 12px corners. play() runs the icon's own move and lights the well while it plays.

  useIconTurns() plays a group of wells: when the group comes into view its icons play one after another, then,
  while it stays on screen, one plays every TURN_MS in turn, so something is always gently moving (on phones too,
  where nothing can be hovered). Hovering or focusing a tile plays its icon at once. Nothing plays off screen, in a
  hidden tab or with reduced motion (the icons then simply stand).
*/

const TURN_MS = 2600;
const FIRST_STEP = 160;
const PLAY_MS = 1600; // the longest move (the rocket's flight) is stopped after this
const LIT_MS = 1100;

export type WellHandle = { play: () => void };

type IconComponent = ComponentType<{ size?: number } & RefAttributes<AnimatedIconHandle>>;

export const IconWell = forwardRef<WellHandle, { name: IconName; size?: "md" | "sm"; className?: string }>(function IconWell(
  { name, size = "md", className },
  ref
) {
  const icon = useRef<AnimatedIconHandle>(null);
  const timers = useRef<number[]>([]);
  const [lit, setLit] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      play() {
        timers.current.forEach(clearTimeout);
        icon.current?.startAnimation();
        setLit(true);
        timers.current = [
          window.setTimeout(() => icon.current?.stopAnimation(), PLAY_MS),
          window.setTimeout(() => setLit(false), LIT_MS),
        ];
      },
    }),
    []
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const Icon = ANIMATED_ICONS[name] as IconComponent;
  return (
    <div aria-hidden data-lit={lit || undefined} data-size={size} className={cn("v11-well", className)}>
      <Icon ref={icon} size={24} />
    </div>
  );
});

/** Plays a group of icon wells in turn while the group is on screen (see above). */
export function useIconTurns<T extends HTMLElement>(count: number, enabled = true) {
  const area = useRef<T>(null);
  // The wells' handles, kept in one stable object (read only in effects and handlers, never while rendering).
  const [wells] = useState(() => new Map<number, WellHandle>());

  useEffect(() => {
    const el = area.current;
    if (!el || !enabled || count === 0) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let onScreen = false;
    let visible = document.visibilityState === "visible";
    let seen = false;
    let next = 0;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    const clear = () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
    const play = (i: number) => wells.get(i)?.play();
    const turn = () => {
      play(next);
      next = (next + 1) % count;
      later(turn, TURN_MS);
    };
    const update = () => {
      clear();
      if (!onScreen || !visible) return;
      if (!seen) {
        seen = true;
        for (let i = 0; i < count; i++) later(() => play(i), 250 + i * FIRST_STEP);
        later(turn, 250 + count * FIRST_STEP + TURN_MS);
      } else {
        later(turn, 700);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      update();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      clear();
    };
  }, [count, enabled, wells]);

  /** The ref for well i. */
  const well = (i: number) => (handle: WellHandle | null) => {
    if (handle) wells.set(i, handle);
    else wells.delete(i);
  };
  /** Pointer and focus handlers for the tile that holds well i. */
  const trigger = (i: number) => ({
    onPointerEnter: () => wells.get(i)?.play(),
    onFocus: () => wells.get(i)?.play(),
  });
  return { area, well, trigger };
}
