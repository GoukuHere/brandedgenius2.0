"use client";

import { useEffect, useRef } from "react";

/*
  The page's one texture, at its foot (v5, 2026-11-06). The first version (a random stipple under a haze) read as
  noise, and the developer asked for it "more clean" and for it to respond to the mouse and the scroll:
  - A halftone: dots on an even 12px grid, each sized and lit by one smooth glow rising from the bottom centre. No
    randomness and no haze, so it reads as one clean shape.
  - Scroll: the glow rises and brightens as the footer comes up the screen, tied to the scroll and reversible.
  - Pointer (mouse and trackpad only): the dots near the cursor swell and brighten in a soft spotlight that follows
    it and fades when it leaves.
  One canvas, drawn only while something changes (the scroll, the pointer, the easing settling) and only while the
  footer is on screen; at rest nothing runs. Each frame is a handful of fills: the dots are grouped by brightness.
  Reduced motion: the full glow, still, without the spotlight.
*/

const SKY = [105, 191, 248] as const;
const ICE = [220, 236, 255] as const;
/** Grid spacing in CSS pixels. */
const GAP = 12;
/** Brightness steps: dots in a step share one fill. */
const STEPS = 10;
/** The spotlight's softness in CSS pixels. */
const SPOT = 80;

export function FooterStipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const size = { w: 0, h: 0, ratio: 1 };
    const pointer = { x: 0, y: 0, inside: false };
    const spot = { x: 0, y: 0, strength: 0 };
    let rise = reduce ? 1 : 0;
    let visible = false;
    let raf = 0;
    let last = 0;

    // How far the footer has come up the screen: 0 as it enters, 1 once it is fully in view (or fills the screen).
    const goal = () => {
      if (reduce) return 1;
      const rect = canvas.getBoundingClientRect();
      return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, Math.min(rect.height, window.innerHeight))));
    };

    const resize = () => {
      size.w = canvas.clientWidth;
      size.h = canvas.clientHeight;
      size.ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(size.w * size.ratio));
      canvas.height = Math.max(1, Math.round(size.h * size.ratio));
    };

    const draw = () => {
      const { w, h, ratio } = size;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;
      // The glow: an ellipse resting on the bottom edge (about 360px tall at most, 280px on phones), reaching higher
      // and brighter as the footer rises. The canvas covers the whole footer, so the spotlight works anywhere in it.
      const rx = w * 0.5;
      const ry = Math.min(h, w < 768 ? 280 : 360) * 1.05 * (0.35 + 0.65 * rise);
      const peak = 0.4 + 0.5 * rise;
      const cols = Math.floor(w / GAP);
      const rows = Math.floor(h / GAP);
      const x0 = (w - (cols - 1) * GAP) / 2;
      const y0 = h - GAP / 2 - (rows - 1) * GAP;
      const steps: number[][] = Array.from({ length: STEPS }, () => []);
      const soft = 2 * SPOT * SPOT;
      for (let j = 0; j < rows; j++) {
        const y = y0 + j * GAP;
        const dy = (h - y) / ry;
        for (let i = 0; i < cols; i++) {
          const x = x0 + i * GAP;
          const dx = (x - w / 2) / rx;
          const d = Math.sqrt(dx * dx + dy * dy);
          let level = d < 1 ? (1 - d) ** 1.6 * peak : 0;
          if (spot.strength > 0.002) {
            const sx = x - spot.x;
            const sy = y - spot.y;
            level += 0.85 * spot.strength * Math.exp(-(sx * sx + sy * sy) / soft);
          }
          if (level < 0.035) continue;
          const l = Math.min(1, level);
          steps[Math.min(STEPS - 1, Math.floor(l * STEPS))].push(x, y, 0.5 + 1.2 * l);
        }
      }
      steps.forEach((dots, s) => {
        if (!dots.length) return;
        const l = (s + 0.5) / STEPS;
        // The brightest dots lean towards ice.
        const k = Math.max(0, (l - 0.7) / 0.3);
        const [r, g, b] = SKY.map((v, c) => Math.round(v + (ICE[c] - v) * k));
        ctx.fillStyle = `rgb(${r} ${g} ${b} / ${(0.1 + 0.75 * l).toFixed(3)})`;
        ctx.beginPath();
        for (let n = 0; n < dots.length; n += 3) {
          ctx.moveTo(dots[n] + dots[n + 2], dots[n + 1]);
          ctx.arc(dots[n], dots[n + 1], dots[n + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      });
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const target = goal();
      rise += (target - rise) * (1 - Math.exp(-dt * 8));
      const want = pointer.inside ? 1 : 0;
      spot.strength += (want - spot.strength) * (1 - Math.exp(-dt * 10));
      const follow = 1 - Math.exp(-dt * 14);
      spot.x += (pointer.x - spot.x) * follow;
      spot.y += (pointer.y - spot.y) * follow;
      draw();
      const settled =
        Math.abs(target - rise) < 0.002 &&
        Math.abs(want - spot.strength) < 0.003 &&
        Math.abs(pointer.x - spot.x) < 0.5 &&
        Math.abs(pointer.y - spot.y) < 0.5;
      if (!settled && visible) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const onPointer = (event: PointerEvent) => {
      if (!fine || reduce) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      // A spotlight that is just appearing starts under the pointer instead of sweeping in from its last place.
      if (inside && spot.strength < 0.01) {
        spot.x = x;
        spot.y = y;
      }
      if (inside) {
        pointer.x = x;
        pointer.y = y;
      }
      if (inside !== pointer.inside || inside) {
        pointer.inside = inside;
        wake();
      }
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };

    resize();
    rise = goal();
    draw();
    const resizer = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizer.observe(canvas);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = 0;
        wake();
      }
    });
    watcher.observe(canvas);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      resizer.disconnect();
      watcher.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
