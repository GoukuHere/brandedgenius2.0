"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Keeps a glass stage smooth on slower graphics chips (2026-11-07: the developer found v8 and v9 slow on desktop and
 * phone). It watches the frame rate; when frames run slow (under 55 a second) for two seconds in a row, the canvas
 * renders at a lower pixel density, one step at a time, never below `min` (1 = the screen's own CSS pixels). It
 * never steps back up, so the picture does not pump. On a fast machine nothing changes.
 */
export function AdaptiveDensity({ min = 1 }: { min?: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const start = useThree((s) => s.viewport.dpr);
  const state = useRef({ dpr: 0, settle: 0, time: 0, frames: 0, slow: 0 });
  useFrame((_, delta) => {
    const s = state.current;
    if (!s.dpr) s.dpr = start;
    if (s.dpr <= min + 0.01) return;
    const dt = Math.min(delta, 0.25);
    // Let the page settle first (loading, the first video frames), and again after each change of size.
    if (s.settle < 2) {
      s.settle += dt;
      return;
    }
    s.time += dt;
    s.frames += 1;
    if (s.time < 1) return;
    const fps = s.frames / s.time;
    s.time = 0;
    s.frames = 0;
    s.slow = fps < 55 ? s.slow + 1 : 0;
    if (s.slow < 2) return;
    // A big step when frames are very slow, a small one when they are only a little slow.
    s.dpr = Math.max(min, s.dpr * (fps < 35 ? 0.72 : 0.84));
    setDpr(s.dpr);
    s.slow = 0;
    s.settle = 1;
  });
  return null;
}
