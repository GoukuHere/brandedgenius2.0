"use client";

import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/*
  The beam core of the 21st.dev "Animated Beam Integration" component (abushaidislam7, after Magic UI's
  AnimatedBeam), adapted for Branded Genius v3: motion/react, brand blues, re-measured with a ResizeObserver,
  and the light only travels while the diagram is on screen.
*/

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3.2,
  delay = 0,
  pathColor = "#ffffff",
  pathWidth = 1.5,
  pathOpacity = 0.1,
  gradientStartColor = "#69bff8",
  gradientStopColor = "#dcecff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef, { margin: "80px" });
  const [pathD, setPathD] = useState("");
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [grad, setGrad] = useState({ x1: "0", y1: "0", x2: "0", y2: "0" });

  const update = useCallback(() => {
    const c = containerRef.current;
    const a = fromRef.current;
    const b = toRef.current;
    if (!c || !a || !b) return;
    const cr = c.getBoundingClientRect();
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    setSize({ width: cr.width, height: cr.height });
    const sx = ra.left - cr.left + ra.width / 2 + startXOffset;
    const sy = ra.top - cr.top + ra.height / 2 + startYOffset;
    const ex = rb.left - cr.left + rb.width / 2 + endXOffset;
    const ey = rb.top - cr.top + rb.height / 2 + endYOffset;
    const cx = (sx + ex) / 2;
    const cy = (sy + ey) / 2 - curvature;
    setPathD(`M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`);
    setGrad({ x1: `${sx}`, y1: `${sy}`, x2: `${ex}`, y2: `${ey}` });
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  useEffect(() => {
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (fromRef.current) ro.observe(fromRef.current);
    if (toRef.current) ro.observe(toRef.current);
    return () => ro.disconnect();
  }, [update, containerRef, fromRef, toRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      fill="none"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    >
      <defs>
        <linearGradient id={`beam-${id}`} gradientUnits="userSpaceOnUse" x1={grad.x1} y1={grad.y1} x2={grad.x2} y2={grad.y2}>
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="30%" stopColor={gradientStartColor} stopOpacity="0.9" />
          <stop offset="65%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      {pathD && inView && (
        <motion.path
          className="motion-reduce:hidden"
          d={pathD}
          stroke={`url(#beam-${id})`}
          strokeWidth={pathWidth * 1.6}
          strokeLinecap="round"
          strokeDasharray="44 156"
          initial={{ strokeDashoffset: reverse ? 0 : 200 }}
          animate={{ strokeDashoffset: reverse ? 200 : 0 }}
          transition={{ duration, delay, ease: [0.45, 0.05, 0.55, 0.95], repeat: Infinity, repeatType: "loop" }}
        />
      )}
    </svg>
  );
}
