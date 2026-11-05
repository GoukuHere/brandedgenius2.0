"use client";

/*
  Compare: two layers in one panel, split by a divider the reader can drag.

  Based on the Compare component by Aceternity UI (ui.aceternity.com/components/compare), as installed from
  21st.dev, rewritten for Branded Genius:
  - any content instead of two images. `before` shows left of the divider, `after` right of it. Both layers sit
    in one grid cell at the same size and `after` is clipped with clip-path, so both always stay in the DOM and
    screen readers read both. With `rows`, the layers become subgrids of that many rows, so row n of `before` and
    row n of `after` always share one height and line up exactly.
  - a layer's content can be anchored to the divider instead of revealed in place (`anchorAfter`,
    `anchorBefore`): it rides along with it, so the divider never cuts through words; only the panel's edges clip
    the content as it slides in or out. The layer's surface stays put and is still clipped at the divider.
  - the position (0 to 100, the share of the width that shows `before`) is a motion value: dragging, gliding and
    any scroll-linked driving never re-render React. Pass a number to control it, a MotionValue to share it with
    the owner (the reader's input is written into it), or nothing for an uncontrolled slider.
  - the handle is a real slider: role="slider", Arrow keys and Page Up/Down step to the next notch, Home/End go to
    the ends, and the spoken value comes from `valueText` (German by default).
  - pointer: drag the handle, or press anywhere on the panel with a mouse; on touch, a sideways swipe drags and a
    tap moves the divider there. touch-action: pan-y keeps vertical page scrolling on phones.
  - removed from the original: the sparkles, the setTimeout autoplay loop and the @tabler/icons-react handle
    (now lucide's ChevronsLeftRight); brand colours only.
*/

import { ChevronsLeftRight } from "lucide-react";
import {
  animate,
  isMotionValue,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
/** Keys and presses glide the divider to its new place; drags follow the pointer directly. */
const GLIDE = { duration: 0.45, ease: EASE };
/** The handle's centre never comes closer to a panel edge than this, so it (and its focus ring) stays whole. */
const EDGE_PX = 32;
/** A touch must travel this far sideways before it moves the divider; anything more vertical scrolls the page. */
const SLOP_PX = 6;
/** Keyboard steps land on multiples of this. */
const NOTCH = 5;

const clamp = (v: number) => Math.min(100, Math.max(0, v));
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** From `base`, the next notch in the direction of `delta`, then the rest of the step: 63 + 5 = 65, 65 + 5 = 70. */
function stepFrom(base: number, delta: number) {
  const notch = delta > 0 ? Math.floor(base / NOTCH + 1e-6) * NOTCH : Math.ceil(base / NOTCH - 1e-6) * NOTCH;
  return clamp(notch + delta);
}

const KEYS: Record<string, (value: number) => number> = {
  ArrowRight: (v) => stepFrom(v, NOTCH),
  ArrowUp: (v) => stepFrom(v, NOTCH),
  ArrowLeft: (v) => stepFrom(v, -NOTCH),
  ArrowDown: (v) => stepFrom(v, -NOTCH),
  PageUp: (v) => stepFrom(v, 4 * NOTCH),
  PageDown: (v) => stepFrom(v, -4 * NOTCH),
  Home: () => 0,
  End: () => 100,
};

const defaultValueText = (value: number) => `${value} %`;

export type CompareProps = {
  /** The layer shown left of the divider. */
  before: ReactNode;
  /** The layer shown right of the divider, drawn over `before` and clipped at the divider. */
  after: ReactNode;
  /**
   * Divider position, 0 to 100: the share of the panel's width, from the left, that shows `before`. A number
   * makes the slider controlled (update it from onValueChange). A MotionValue is shared: its owner can drive it
   * every frame without React renders, and the reader's input is written into it as well.
   */
  value?: number | MotionValue<number>;
  /** Start position when `value` is left out. */
  defaultValue?: number;
  /** Called with the new position whenever the reader moves the divider (drag, press, tap or keys). */
  onValueChange?: (value: number) => void;
  /** Accessible name of the slider handle. */
  label: string;
  /** Spoken value for a whole-number position, e.g. (v) => `Klassischer Weg ${v} %`. */
  valueText?: (value: number) => string;
  /** Number of rows the two layers share as subgrids, so row n of each layer always has the same height. */
  rows?: number;
  /**
   * Anchor `after`'s content to the divider: its left edge rides on the divider (plus the content's own left
   * padding), sliding in from the panel's right edge. The content moves by the divider's share of its own width,
   * so keep the layer free of horizontal padding and pad the content instead; that width is then the panel's.
   */
  anchorAfter?: boolean;
  /** Anchor `before`'s content to the divider the same way: its right edge rides on it (a push). */
  anchorBefore?: boolean;
  className?: string;
  /** Classes for the `before` layer (its surface). */
  beforeClassName?: string;
  /** Classes for the `after` layer (its surface, clipped at the divider). */
  afterClassName?: string;
};

type Drag = { id: number; x: number; y: number; live: boolean; offset: number };

export function Compare({
  before,
  after,
  value,
  defaultValue = 50,
  onValueChange,
  label,
  valueText = defaultValueText,
  rows,
  anchorAfter = false,
  anchorBefore = false,
  className,
  beforeClassName,
  afterClassName,
}: CompareProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const glide = useRef<{ controls: AnimationPlaybackControls; to: number } | null>(null);

  const controlled = typeof value === "number";
  const own = useMotionValue(clamp(controlled ? value : defaultValue));
  const pos = isMotionValue(value) ? value : own;

  // A controlled number is mirrored into the motion value that draws the panel.
  useEffect(() => {
    if (typeof value === "number") own.set(clamp(value));
  }, [value, own]);

  const clipPath = useTransform(() => `inset(0 0 0 ${pos.get()}%)`);
  const lineTransform = useTransform(() => `translateX(${pos.get()}%)`);
  // The line fades out in the last 2% at either edge, where it would only trace the panel's border.
  const lineOpacity = useTransform(() => Math.min(1, Math.min(pos.get(), 100 - pos.get()) / 2));
  const handleTransform = useTransform(() => `translateX(clamp(${EDGE_PX}px, ${pos.get()}%, calc(100% - ${EDGE_PX}px)))`);
  // Anchored content is a full-width layer, so a percentage of its own width is that share of the panel's.
  const afterShift = useTransform(() => {
    const v = pos.get();
    return anchorAfter ? `translateX(${v}%)` : "none";
  });
  const beforeShift = useTransform(() => {
    const v = pos.get();
    return anchorBefore ? `translateX(${v - 100}%)` : "none";
  });

  // The slider's value attributes follow the motion value directly (whole numbers only), so moving the divider
  // never re-renders. The first render writes them too, so the server markup is complete.
  const describe = useEffectEvent((whole: number) => valueText(whole));
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    let shown = Number.NaN;
    const write = (v: number) => {
      const whole = Math.round(v);
      if (whole === shown) return;
      shown = whole;
      handle.setAttribute("aria-valuenow", String(whole));
      handle.setAttribute("aria-valuetext", describe(whole));
    };
    write(pos.get());
    return pos.on("change", write);
  }, [pos]);

  const rendered = Math.round(pos.get());

  function toValue(clientX: number) {
    const box = panelRef.current?.getBoundingClientRect();
    if (!box || !box.width) return pos.get();
    return ((clientX - box.left) / box.width) * 100;
  }

  function move(next: number, smooth: boolean) {
    const v = clamp(next);
    glide.current?.controls.stop();
    glide.current = null;
    onValueChange?.(v);
    if (controlled) return;
    if (smooth && !prefersReducedMotion()) {
      const controls = animate(pos, v, {
        ...GLIDE,
        onComplete: () => {
          glide.current = null;
        },
      });
      glide.current = { controls, to: v };
    } else {
      pos.set(v);
    }
  }

  function setDragging(on: boolean) {
    panelRef.current?.toggleAttribute("data-dragging", on);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const handle = handleRef.current;
    const onHandle = !!handle && handle.contains(event.target as Node);
    const mouse = event.pointerType === "mouse";
    event.currentTarget.setPointerCapture(event.pointerId);
    // A mouse press must not start a text selection. Focus goes to the slider, as on a native range input, so the
    // keys work right after (not on touch, where there is no keyboard to follow up with).
    if (mouse) event.preventDefault();
    if (event.pointerType !== "touch") handle?.focus({ preventScroll: true });

    // Grabbing the handle keeps the distance between the pointer and its centre, so it never jumps.
    let offset = 0;
    if (onHandle) {
      const box = handle.getBoundingClientRect();
      offset = toValue(event.clientX) - toValue(box.left + box.width / 2);
    }
    const live = mouse || onHandle;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, live, offset };
    if (live) setDragging(true);
    if (mouse && !onHandle) move(toValue(event.clientX), true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.live) {
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (Math.abs(dx) < SLOP_PX || Math.abs(dx) < Math.abs(dy)) return;
      current.live = true;
      setDragging(true);
    }
    move(toValue(event.clientX) - current.offset, false);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, released: boolean) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    // A touch or pen tap that never became a drag moves the divider to where it landed.
    const still = Math.hypot(event.clientX - current.x, event.clientY - current.y) < SLOP_PX;
    if (released && !current.live && still) move(toValue(event.clientX), true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = KEYS[event.key];
    if (!step) return;
    event.preventDefault();
    const base = glide.current ? glide.current.to : pos.get();
    move(step(base), true);
  }

  // With rows, the layer and the content inside it are subgrids over all of them, so the rows stay shared.
  const rowsShared: CSSProperties | undefined = rows
    ? { gridRow: "1 / -1", gridColumn: "1", display: "grid", gridTemplateRows: "subgrid", gridTemplateColumns: "minmax(0, 1fr)" }
    : undefined;
  const layer: CSSProperties = rowsShared ?? { gridArea: "1 / 1" };

  return (
    <div
      ref={panelRef}
      className={cn(
        // pan-y keeps vertical scrolling (and pinch zoom) with the browser; sideways moves come to the slider.
        "group/compare relative grid cursor-ew-resize touch-pan-y touch-pinch-zoom overflow-hidden select-none [-webkit-tap-highlight-color:transparent] data-dragging:cursor-grabbing",
        className
      )}
      style={{ gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: rows ? `repeat(${rows}, auto)` : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endDrag(event, true)}
      onPointerCancel={(event) => endDrag(event, false)}
      onLostPointerCapture={(event) => endDrag(event, false)}
    >
      <div className={beforeClassName} style={layer}>
        <motion.div className={cn(anchorBefore && "will-change-transform")} style={{ ...rowsShared, transform: beforeShift }}>
          {before}
        </motion.div>
      </div>
      <motion.div className={afterClassName} style={{ ...layer, clipPath }}>
        <motion.div className={cn(anchorAfter && "will-change-transform")} style={{ ...rowsShared, transform: afterShift }}>
          {after}
        </motion.div>
      </motion.div>

      {/* The divider: a 1px sky line exactly on the clip edge. */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ transform: lineTransform, opacity: lineOpacity }}>
        <span className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-sky/80" />
      </motion.div>

      {/* The handle rides on the line and stays whole at the panel's edges. */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ transform: handleTransform }}>
        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rendered}
          aria-valuetext={valueText(rendered)}
          onKeyDown={onKeyDown}
          className={cn(
            "glass pointer-events-auto absolute top-1/2 left-0 grid size-12 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full bg-[rgb(9_18_34/0.88)] text-white",
            "shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_0_0_1px_rgb(105_191_248/0.4),0_12px_30px_-10px_rgb(0_0_0/0.9)]",
            "transition-[scale,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_rgb(105_191_248/0.75),0_12px_30px_-10px_rgb(0_0_0/0.9)]",
            "group-data-dragging/compare:scale-95 group-data-dragging/compare:cursor-grabbing"
          )}
        >
          <ChevronsLeftRight aria-hidden strokeWidth={1.5} className="size-5" />
        </div>
      </motion.div>
    </div>
  );
}
