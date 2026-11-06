"use client";

import { useEffect } from "react";

/*
  The page's one entrance trigger (motion v6, 2026-11-07; the CSS is the motion block at the end of globals.css).
  Every element marked data-reveal or data-reveal-group, and every page section (for the hairline between sections),
  gets data-shown once, when it first comes up into the screen; CSS then plays its entrance. Elements that mount
  later (a stage that only exists on large screens, the phone menu) are picked up as they appear.

  It also feeds the desktop mouse light on glass panels: the pointer's position inside the panel under it, as
  --mx / --my, at most once per frame and only for a real mouse.

  Reduced motion: everything is marked shown at once (the CSS hides nothing then anyway) and no light runs.
*/

const TARGETS = "[data-reveal],[data-reveal-group],main > *";

export function RevealObserver() {
  useEffect(() => {
    const show = (el: Element) => el.setAttribute("data-shown", "");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(TARGETS).forEach(show);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      // A little above the bottom edge, so an entrance plays where the reader is looking, not under the fold.
      { rootMargin: "0px 0px -8% 0px" }
    );
    const watch = (root: ParentNode) => {
      root.querySelectorAll(TARGETS).forEach((el) => {
        if (!el.hasAttribute("data-shown")) io.observe(el);
      });
    };
    watch(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(TARGETS) && !node.hasAttribute("data-shown")) io.observe(node);
          watch(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const target = last?.target;
      const panel = target instanceof Element ? target.closest(".glass") : null;
      if (!last || !(panel instanceof HTMLElement)) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", `${Math.round(last.clientX - rect.left)}px`);
      panel.style.setProperty("--my", `${Math.round(last.clientY - rect.top)}px`);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (mouse) document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
