"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  v10's overlay from section to section (the client on v2: "I see this kind of overlay section to section, not this
  hard cut"), in normal scrolling.

  Every part of the page is a Sheet in a slot. A sheet scrolls like any section until its foot reaches the foot of
  the screen (a sheet shorter than the screen: until its top reaches the top). There it stays (CSS sticky) while the
  next sheet, which follows it in the page, slides up over it; meanwhile it sinks back a little and darkens. Once it
  is covered it scrolls away underneath. Each slot holds an empty room after its sheet, as tall as that last
  stretch, and the next slot is pulled up by the same amount, so the page is exactly as long as without it and
  nothing is ever pinned for reading.

  StackMotion measures the sheets (on load, resize and whenever a sheet changes size), sets each one's sticky top
  and room, and on scroll sets how far each one is covered: one rAF-throttled listener, writing only what changed.
  Where the next sheet could not cover the whole of the screen, the pair simply scrolls (no overlay). Without
  script the sheets are plain sections one after another. Reduced motion: the overlay stays, without the sinking.
*/

export type Light = "a" | "b" | "c" | "d";

export function Sheet({ light, className, children }: { light: Light; className?: string; children: ReactNode }) {
  return (
    <div data-v10-slot className="v10-slot">
      <div data-v10-sheet className={cn("v10-sheet relative", className)}>
        <div aria-hidden className="v10-bg">
          <div className="v10-light" data-light={light} />
          <div className="v10-grain" />
        </div>
        <div className="v10-content">{children}</div>
        <div aria-hidden data-v10-shade className="v10-shade" />
      </div>
      <div aria-hidden data-v10-room />
    </div>
  );
}

const SINK = 0.05;
const SHADE = 0.6;

type Item = {
  sheet: HTMLElement;
  shade: HTMLElement;
  /** Scroll position at which the sheet stops and the next one starts to cover it. */
  start: number;
  /** Scroll over which it is covered (0: no overlay for this sheet). */
  length: number;
  covered: number;
};

export function StackMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A probe for the small viewport height (100svh), which does not change while a phone's toolbars move.
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);

    let items: Item[] = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      for (const item of items) {
        const covered = item.length > 0 ? Math.min(1, Math.max(0, (y - item.start) / item.length)) : 0;
        if (covered === item.covered) continue;
        item.covered = covered;
        item.shade.style.opacity = (SHADE * covered).toFixed(3);
        if (reduced) continue;
        if (covered > 0) {
          item.sheet.style.willChange = "transform";
          item.sheet.style.transform = `scale(${(1 - SINK * covered).toFixed(4)})`;
        } else {
          item.sheet.style.willChange = "";
          item.sheet.style.transform = "";
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const measure = () => {
      const slots = [...document.querySelectorAll<HTMLElement>("[data-v10-slot]")];
      const vh = probe.getBoundingClientRect().height || window.innerHeight;
      const y = window.scrollY;
      // Read everything first, then write.
      const parts = slots.map((slot) => {
        const sheet = slot.querySelector<HTMLElement>(":scope > [data-v10-sheet]");
        const shade = sheet?.querySelector<HTMLElement>(":scope > [data-v10-shade]");
        const room = slot.querySelector<HTMLElement>(":scope > [data-v10-room]");
        const gap = parseFloat(getComputedStyle(slot).paddingTop) || 0;
        return {
          slot,
          sheet,
          shade,
          room,
          gap,
          h: sheet?.offsetHeight ?? 0,
          // The sheet's place in the page: its slot's top plus the gap (the room and the pull cancel out).
          top: slot.getBoundingClientRect().top + y + gap,
        };
      });
      const next: Item[] = [];
      parts.forEach((part, i) => {
        const { slot, sheet, shade, room, gap, h, top } = part;
        if (!sheet || !shade || !room) return;
        const after = parts[i + 1];
        // Where it stops: its foot at the screen's foot, or its top at the top if it is shorter than the screen.
        const stop = Math.min(gap, vh - h - gap);
        // The stretch over which the next sheet covers what is left of it on screen.
        let length = after ? h + gap + Math.min(stop, 0) : 0;
        if (after && after.h < length - 2 * gap) length = 0;
        slot.style.zIndex = String(i + 2);
        sheet.style.position = length ? "sticky" : "";
        sheet.style.top = length ? `${stop}px` : "";
        // It sinks back towards the top of what is on screen of it.
        sheet.style.transformOrigin = `50% ${Math.max(0, -stop)}px`;
        room.style.height = `${length}px`;
        if (after) after.slot.style.marginTop = length ? `${-length}px` : "";
        next.push({ sheet, shade, start: top - stop, length, covered: -1 });
      });
      items = next;
      update();
    };

    let measureFrame = 0;
    const remeasure = () => {
      if (!measureFrame)
        measureFrame = requestAnimationFrame(() => {
          measureFrame = 0;
          measure();
        });
    };

    measure();
    const ro = new ResizeObserver(remeasure);
    document.querySelectorAll("[data-v10-sheet]").forEach((sheet) => ro.observe(sheet));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      probe.remove();
    };
  }, []);

  return null;
}
