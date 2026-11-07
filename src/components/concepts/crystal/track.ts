/*
  Scroll tracking shared by the two glass concepts (v8 Kristall, v9 Obsidian). Both keep one fixed WebGL stage
  behind the page and read, once per frame, where the page's sections are. A section's pose holds while it covers
  the middle of the screen; between two sections the stage blends from one pose to the next while their border
  crosses the middle (over BLEND of the screen height either side), so the object travels with the reading.
*/

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 below `a`, 1 above `b`, smooth in between. */
export const band = (a: number, b: number, v: number) => smooth(clamp01((v - a) / (b - a)));
/** Frame-rate independent easing of `from` towards `to` (higher k is snappier). */
export const damp = (from: number, to: number, k: number, dt: number) => from + (to - from) * (1 - Math.exp(-k * Math.min(dt, 0.05)));

const BLEND = 0.36;

/**
 * The blend weights of a page's sections for the current scroll: weights[i] is how far the stage has moved from
 * section i-1's pose to section i's (weights[0] is always 1). Apply them in order: pose = mix(pose, P[i], w[i]).
 */
export function sectionWeights(sections: HTMLElement[], vh: number): number[] {
  const mid = vh * 0.5;
  const w = vh * BLEND;
  return sections.map((el, i) => {
    if (i === 0) return 1;
    const top = el.getBoundingClientRect().top;
    return smooth(clamp01((mid + w - top) / (2 * w)));
  });
}

/** How far a tall section with a sticky inner has been read: 0 when it pins, 1 when it lets go. */
export function pinProgress(el: HTMLElement, vh: number) {
  const r = el.getBoundingClientRect();
  return clamp01(-r.top / Math.max(1, r.height - vh));
}

/** How far a section has passed through the screen: 0 when its top reaches the bottom edge, 1 when its bottom leaves the top. */
export function passProgress(el: HTMLElement, vh: number) {
  const r = el.getBoundingClientRect();
  return clamp01((vh - r.top) / (r.height + vh));
}

/** The pointer, -1 to 1 from the screen's centre, eased. Shared by both stages; touch devices never move it. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
let listening = false;
export function listenPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
}
