"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/*
  Smooth scrolling (2026-11-07, the developer asked for it). Lenis eases the mouse wheel and the trackpad, so each
  wheel step glides to rest instead of jumping. Lenis moves the page's real scroll position, so the sticky stages,
  Motion's scroll progress, the CSS scroll timelines and the entrance observer all keep working unchanged.

  - Phones and tablets keep their own touch scrolling (syncTouch off): it is already smooth, and a JavaScript-driven
    touch scroll would feel heavier.
  - In-page links (the navigation) glide too, honouring the page's scroll padding and each section's scroll margin.
  - A sideways swipe over the Fallstudien cards still scrolls the cards (data-lenis-prevent-horizontal there).
  - It pauses while something else holds the page still: the phone menu (an inline overflow on <html>) and the video
    player (overflow-hidden on <body>).
  - Visitors who ask for reduced motion get the browser's own scrolling.

  The first site (v1) dropped Lenis for native scrolling after the client found the page slow; this one is kept light
  (no touch smoothing, one requestAnimationFrame loop that idles at rest).
*/
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: true,
      stopInertiaOnNavigate: true,
    });

    const sync = () => {
      const held = document.documentElement.style.overflow === "hidden" || document.body.classList.contains("overflow-hidden");
      if (held) lenis.stop();
      else lenis.start();
    };
    const watcher = new MutationObserver(sync);
    watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    watcher.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    sync();

    return () => {
      watcher.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
