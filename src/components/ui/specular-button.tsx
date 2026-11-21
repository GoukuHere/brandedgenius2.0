"use client";

import {
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";

/*
  SpecularButton: React Bits' SpecularButton look (reactbits.dev), a thin edge light that rests on the top left corner
  and runs along the edge towards the pointer when it comes near, with a fainter light on the opposite side.

  Round 5 (2026-11-21): drawn in CSS, no WebGL. Each button used to own a WebGL2 canvas and its own pointer loop. In
  Roman's Chrome (laptop on 8% battery) the canvases lost their GPU contexts and showed as white boxes with a broken
  image icon on /kontakt, and every visible button ran its own animation frame on every mouse move. Now:
  - The light is a masked ring (.specular-button__light, styles in globals.css): two radial lights on the edge, the
    key light at --sb-x / --sb-y and a back light at the mirrored point, over a faint hairline; a blurred copy of the
    two lights (.specular-button__glow) gives the shader's soft glow on both sides of the line.
  - One shared pointer listener for all buttons, at most once per frame, measures only the buttons on screen and sets
    --sb-x, --sb-y (the nearest point on the button's edge) and --sb-on (0 far, 1 within reach). CSS eases all three
    (registered properties), so nothing runs between pointer moves.
  - Touch and pen: the light leans to the touch point while pressed and settles back on release.
  - Reduced motion or no pointer: the light rests on the top left corner at its idle strength.
  The props keep their old names, so every caller stays as it was; the WebGL-only ones are accepted and ignored.
*/

/** How far from the button (px) the pointer starts to pull the light, as in the original (proximity 250). */
const REACH = 250;

type Entry = { el: HTMLElement; visible: boolean; on: boolean };
const buttons = new Set<Entry>();
let pointer: { x: number; y: number } | null = null;
let frame = 0;
let listening = false;
let observer: IntersectionObserver | null = null;
let calm = false;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** The resting point: the 45 degree point of the top left corner (12px corners). */
const REST = 3.5;

/**
 * Where the light sits, in the button's own px (origin top left), as the shader placed it. Outside the button: the
 * nearest point on its edge. Inside: near an edge it stays on that edge, and the deeper the pointer goes, the more it
 * returns to the top left corner, leaning a little along the top edge (pointer right) or down the left side
 * (pointer left), by up to 6% of the edge's length.
 */
function lightPoint(x: number, y: number, w: number, h: number): [number, number] {
  const cx = Math.min(Math.max(x, 0), w);
  const cy = Math.min(Math.max(y, 0), h);
  if (cx !== x || cy !== y) return [cx, cy];
  const toLeft = x;
  const toRight = w - x;
  const toTop = y;
  const toBottom = h - y;
  const least = Math.min(toLeft, toRight, toTop, toBottom);
  const edge: [number, number] =
    least === toTop ? [x, 0] : least === toBottom ? [x, h] : least === toLeft ? [0, y] : [w, y];
  // The lean, along the edge from the corner: negative runs right along the top, positive down the left side.
  const perimeter = 2 * (w + h);
  const lean = -(((x - w / 2) / (w / 2)) * 0.06 + ((h / 2 - y) / (h / 2)) * 0.02) * perimeter;
  const sway: [number, number] = lean < 0 ? [Math.min(REST - lean, w), 0] : [0, Math.min(REST + lean, h)];
  const depth = smooth(Math.min(Math.max(least / (h * 0.4), 0), 1));
  return [edge[0] + (sway[0] - edge[0]) * depth, edge[1] + (sway[1] - edge[1]) * depth];
}

function rest(entry: Entry) {
  if (!entry.on) return;
  entry.on = false;
  const s = entry.el.style;
  s.removeProperty("--sb-x");
  s.removeProperty("--sb-y");
  s.setProperty("--sb-on", "0");
}

function paint() {
  frame = 0;
  for (const entry of buttons) {
    if (!entry.visible) continue;
    if (!pointer || entry.el.matches(":disabled")) {
      rest(entry);
      continue;
    }
    const rect = entry.el.getBoundingClientRect();
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    const distance = Math.hypot(Math.max(-x, x - rect.width, 0), Math.max(-y, y - rect.height, 0));
    const near = smooth(Math.min(Math.max(1 - distance / REACH, 0), 1));
    if (near <= 0) {
      rest(entry);
      continue;
    }
    const [rx, ry] = lightPoint(x, y, rect.width, rect.height);
    const s = entry.el.style;
    s.setProperty("--sb-x", `${rx.toFixed(1)}px`);
    s.setProperty("--sb-y", `${ry.toFixed(1)}px`);
    s.setProperty("--sb-on", near.toFixed(3));
    entry.on = true;
  }
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(paint);
};

function onMove(event: PointerEvent) {
  // A touch only steers while it is down (a finger has no hover).
  if (event.pointerType !== "mouse" && event.buttons === 0) return;
  pointer = { x: event.clientX, y: event.clientY };
  schedule();
}
function onDown(event: PointerEvent) {
  pointer = { x: event.clientX, y: event.clientY };
  schedule();
}
function onEnd(event: PointerEvent) {
  if (event.pointerType === "mouse") return;
  pointer = null;
  schedule();
}
function onLeave() {
  pointer = null;
  schedule();
}
/**
 * The page moves under a resting mouse while it scrolls. Only a lit button is measured again (so its light keeps to
 * the pointer and settles once the button scrolls out of reach); measuring every button on every scrolled frame
 * forced a layout per frame.
 */
function onScroll() {
  if (!pointer) return;
  for (const entry of buttons) {
    if (entry.on) {
      schedule();
      return;
    }
  }
}

function register(el: HTMLElement) {
  if (!listening) {
    calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!calm) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onEnd, { passive: true });
      window.addEventListener("pointercancel", onEnd, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((records) => {
            for (const record of records) {
              for (const entry of buttons) {
                if (entry.el !== record.target) continue;
                entry.visible = record.isIntersecting;
                if (!entry.visible) rest(entry);
              }
            }
          });
    listening = true;
  }
  const entry: Entry = { el, visible: !observer, on: false };
  buttons.add(entry);
  observer?.observe(el);
  return () => {
    observer?.unobserve(el);
    buttons.delete(entry);
    if (buttons.size === 0 && listening) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      observer?.disconnect();
      observer = null;
      cancelAnimationFrame(frame);
      frame = 0;
      listening = false;
    }
  };
}

type LightProps = {
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  /** Strength of the light when the pointer is right at the button (1 = full). */
  intensity?: number;
  /** Strength of the light at rest, 0 to 1. */
  idleIntensity?: number;
  /** Accepted for compatibility with the WebGL version; no effect. */
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  className?: string;
  style?: CSSProperties;
};

type AsButton = LightProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof LightProps> & { href?: undefined };
type AsLink = LightProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LightProps> & { href: string };
export type SpecularButtonProps = AsButton | AsLink;

export function SpecularButton(props: SpecularButtonProps) {
  const {
    children = "Get Started",
    size = "lg",
    radius = 12,
    tint = "#ffffff",
    tintOpacity = 0.04,
    blur = 0,
    textColor = "#f5f5f5",
    lineColor = "#ffffff",
    baseColor = "#525252",
    intensity = 1,
    idleIntensity = 0.35,
    followMouse = true,
    /* eslint-disable @typescript-eslint/no-unused-vars -- WebGL-era props, kept so callers stay unchanged */
    shineSize,
    shineFade,
    thickness,
    glow,
    speed,
    proximity,
    autoAnimate,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    className,
    style,
    ...rest
  } = props;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !followMouse) return undefined;
    return register(el);
  }, [followMouse]);

  const classes = cn("specular-button", `specular-button--${size}`, className);
  const vars = {
    "--sb-radius": `${radius}px`,
    "--sb-tint": tint,
    "--sb-tint-opacity": tintOpacity,
    "--sb-blur": `${blur}px`,
    "--sb-text-color": textColor,
    "--sb-line": lineColor,
    "--sb-base": baseColor,
    "--sb-idle": Math.min(Math.max(idleIntensity, 0), 1),
    "--sb-max": Math.max(intensity, 0),
    ...style,
  } as CSSProperties;
  const inner = (
    <>
      <span className="specular-button__glow" aria-hidden="true">
        <span className="specular-button__light" />
      </span>
      <span className="specular-button__light" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </>
  );

  if (typeof rest.href === "string") {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a ref={elementRef as Ref<HTMLAnchorElement>} {...anchorProps} className={classes} style={vars}>
        {inner}
      </a>
    );
  }
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={elementRef as Ref<HTMLButtonElement>} type="button" {...buttonProps} className={classes} style={vars}>
      {inner}
    </button>
  );
}

export default SpecularButton;
