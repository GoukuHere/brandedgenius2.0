"use client";

import { useEffect, type RefObject } from "react";

/**
 * Marks an element `data-live="1"` while it is on screen (with a margin) and `"0"` once it leaves. The page's CSS
 * pauses every loop inside a `.uc-live` element that is not live, so the drawings only move where they can be seen.
 * The attribute is written straight to the element (no re-render); React never manages it.
 */
export function useLive(ref: RefObject<Element | null>, margin = "160px 0px") {
  useEffect(() => {
    const el = ref.current;
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.live = "1";
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.live = entry.isIntersecting ? "1" : "0";
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
}
