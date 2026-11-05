"use client";

import { useEffect, useRef } from "react";

/*
  v5's one texture (the developer approved it in the v5 plan, 2026-11-06): a still field of sky dots rising from
  the foot of the page, after the stipple glow at the footer of the developer's reference. It is drawn once on a
  canvas (again only when its size changes) and never animates, so it costs nothing while scrolling. The dots are
  densest at the bottom centre and thin out upwards and sideways; they stay faint so the footer text reads.
  Deterministic (seeded), so every visit draws the same field. No orb, no motion, no particles moving.
*/

const SKY = "105 191 248";
const ICE = "220 236 255";

// A small seeded random generator (mulberry32).
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FooterStipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let drawnWidth = 0;
    let drawnHeight = 0;

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || (width === drawnWidth && height === drawnHeight)) return;
      drawnWidth = width;
      drawnHeight = height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const random = seeded(7);
      // Roughly normal (sum of four uniforms), for the spread around the centre.
      const normal = () => (random() + random() + random() + random() - 2) / 0.577;
      const count = Math.round((width * height) / 150);
      for (let i = 0; i < count; i++) {
        const x = width / 2 + normal() * width * 0.22;
        const rise = random() * random(); // 0 at the foot, mostly low
        if (x < 0 || x > width) continue;
        const side = (x - width / 2) / (width * 0.3);
        const alpha = Math.min(0.62, 0.8 * (1 - rise) * Math.exp(-side * side) * (0.35 + 0.65 * random()));
        if (alpha < 0.03) continue;
        ctx.fillStyle = `rgb(${random() < 0.15 ? ICE : SKY} / ${alpha.toFixed(3)})`;
        const size = random() < 0.3 ? 1.5 : 1;
        ctx.fillRect(x, height - rise * height, size, size);
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[260px] md:h-[340px]">
      <div className="absolute inset-0 bg-[radial-gradient(55%_90%_at_50%_100%,rgb(105_191_248/0.08),transparent_72%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
