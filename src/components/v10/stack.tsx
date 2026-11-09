"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  v10's overlay from section to section (the client on v2: "I see this kind of overlay section to section, not this
  hard cut"), in normal scrolling.

  Every part of the page is a Sheet in a slot. A sheet scrolls like any section until its foot reaches the foot of
  the screen (a sheet no taller than the screen: until its top reaches the top). There it stays (CSS sticky) while
  the next sheet, which follows it in the page, slides up over it; once covered it scrolls away underneath. Nothing
  else happens to it: no sinking, no darkening (the developer, after the client's videos: a plain slide). Each slot
  holds an empty room after its sheet, as tall as that last stretch, and the next slot is pulled up by the same
  amount, so the page is exactly as long as without it and nothing is ever held for reading.

  StackMotion only measures: on load, on resize and whenever a sheet changes size it sets each sheet's sticky top
  and its room. It does nothing while scrolling. Where the next sheet could not cover the whole screen, the pair
  simply scrolls. Without script the sheets are plain sections one after another.
*/

export type Light = "a" | "b" | "c" | "d" | "e";

export function Sheet({ light, className, children }: { light: Light; className?: string; children: ReactNode }) {
  return (
    <div data-v10-slot className="v10-slot">
      <div data-v10-sheet className={cn("v10-sheet relative", className)}>
        <div aria-hidden className="v10-bg">
          <div className="v10-light" data-light={light} />
        </div>
        <div className="v10-content">{children}</div>
      </div>
      <div aria-hidden data-v10-room />
    </div>
  );
}

export function StackMotion() {
  useEffect(() => {
    // A probe for the small viewport height (100svh), which does not change while a phone's toolbars move.
    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);

    const measure = () => {
      const slots = [...document.querySelectorAll<HTMLElement>("[data-v10-slot]")];
      const vh = probe.getBoundingClientRect().height || window.innerHeight;
      // Read everything first, then write.
      const parts = slots.map((slot) => {
        const sheet = slot.querySelector<HTMLElement>(":scope > [data-v10-sheet]");
        const room = slot.querySelector<HTMLElement>(":scope > [data-v10-room]");
        const gap = parseFloat(getComputedStyle(slot).paddingTop) || 0;
        return { slot, sheet, room, gap, h: sheet?.offsetHeight ?? 0 };
      });
      parts.forEach((part, i) => {
        const { slot, sheet, room, gap, h } = part;
        if (!sheet || !room) return;
        const after = parts[i + 1];
        // Where it stops: its foot at the screen's foot, or its top at the top if it is no taller than the screen.
        const stop = Math.min(gap, vh - h - gap);
        // The stretch over which the next sheet covers what is left of it on screen.
        let length = after ? h + gap + Math.min(stop, 0) : 0;
        if (after && after.h < length - 2 * gap) length = 0;
        slot.style.zIndex = String(i + 2);
        sheet.style.position = length ? "sticky" : "";
        sheet.style.top = length ? `${stop}px` : "";
        room.style.height = `${length}px`;
        if (after) after.slot.style.marginTop = length ? `${-length}px` : "";
      });
    };

    let frame = 0;
    const remeasure = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };

    measure();
    const ro = new ResizeObserver(remeasure);
    document.querySelectorAll("[data-v10-sheet]").forEach((sheet) => ro.observe(sheet));
    window.addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", remeasure);
      probe.remove();
    };
  }, []);

  return null;
}
