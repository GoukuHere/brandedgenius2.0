"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { AGENTS } from "./agents";
import { CALLS } from "./calls";
import { CHAT } from "./chat";
import { DotGrid, type Scene } from "./kit";
import { MARKETING } from "./marketing";

/*
  v11's four service drawings (2026-11-13), replacing the shared fine-line scenes on this page only (v1 keeps those).
  The client found the old ones abstract ("it's not a chatbot", "better graphics instead of this"), so each is now a
  real product interface that tells one short story per loop, in real words and real tool names:
    agents     a workflow canvas: E-Mail, the KI-Agent, GoHighLevel, Google Calendar, ClickUp
    chat       a chat widget qualifying a lead (the lines are drafts the client still approves: chat.tsx, CHAT_SCRIPT)
    calls      an incoming call, the caller and the AI taking turns, a slot booked in the week
    marketing  a CRM pipeline: leads move from column to column and land in CRM; Conversion steps up
  Each scene draws on a stage of fixed logical size: 1280 x 480 from lg up (the plates keep their size), and below lg
  a narrower, taller phone composition (at most 440px wide, centred) so its words stay 12 to 13px on a phone. The
  stage is scaled as a whole to its box (a transform, never zoom, so iOS scales the text with it). A short desktop
  window (600 to 759px tall) caps the drawing's height so the plate fits under the header; the wide stage would then
  shrink its words below 11px, so such a window gets the compact composition too.

  Behaviour is the shared shell's (sections/service-scenes.tsx): plays only while `playing` (the front plate), from its
  still frame, and only while a fifth of it is on screen; resets to the still frame when it stops; reduced motion
  shows the still frame and runs no clock. Each frame is a pure function of the time.
*/

export type SceneId = "agents" | "chat" | "calls" | "marketing";

export const SCENES: Record<SceneId, Scene> = { agents: AGENTS, chat: CHAT, calls: CALLS, marketing: MARKETING };
export const isSceneId = (id: string): id is SceneId => id in SCENES;

/** Tailwind's lg: the desktop composition from here up, unless the window is short (see frame). */
const LG = "(min-width: 1024px)";
const SHORT = "(min-height: 600px) and (max-height: 759px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/** A media query that is safe to hydrate: false on the server and while hydrating, then the real value. */
function useMedia(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/**
 * The drawing's box. Below lg: the phone stage's aspect, at most 440px wide, centred. From lg: 1280 / 480; on stacked
 * windows its height is capped (the screen less 440px) so the whole plate fits under the header. On short stacked
 * windows (600 to 759px) the compact stage instead, within the same height. The conditions are disjoint, so the
 * order of the generated rules never matters.
 */
const FRAME = [
  "relative mx-auto w-full overflow-hidden",
  "max-lg:aspect-(--scene-phone) max-lg:max-w-[440px]",
  "lg:[@media(max-height:599px)]:aspect-[1280/480]",
  "lg:[@media(min-height:760px)]:aspect-[1280/480] lg:[@media(min-height:760px)]:max-w-[calc((100svh_-_440px)_*_2.6667)]",
  "lg:[@media(min-height:600px)_and_(max-height:759px)]:aspect-(--scene-phone)",
  "lg:[@media(min-height:600px)_and_(max-height:759px)]:max-w-[min(440px,calc((100svh_-_440px)_*_var(--scene-phone-ratio)))]",
].join(" ");

function frame(id: SceneId) {
  const { w, h } = SCENES[id].phone;
  return { style: { "--scene-phone": `${w} / ${h}`, "--scene-phone-ratio": (w / h).toFixed(4) } as CSSProperties, className: FRAME };
}

/** An empty box of the drawing's size, holding its place until the page runs. */
export function SceneBox({ id, className }: { id: SceneId; className?: string }) {
  const f = frame(id);
  return <div aria-hidden style={f.style} className={cn(f.className, className)} />;
}

export function ServiceAnimation({ id, playing, className }: { id: SceneId; playing: boolean; className?: string }) {
  const scene = SCENES[id];
  const box = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(scene.still);
  const [wasPlaying, setWasPlaying] = useState(playing);
  const [width, setWidth] = useState(0);
  const lg = useMedia(LG);
  const short = useMedia(SHORT);
  const wide = lg && !short;
  const reduced = useMedia(REDUCED);
  const live = playing && !reduced;

  // Each time playing starts or stops, the clock goes back to the still frame (adjusted during render, so a stale
  // frame from the last run never shows for a frame).
  if (wasPlaying !== playing) {
    setWasPlaying(playing);
    setClock(scene.still);
  }

  // The stage scales with the box; the observer's first call lands before the first paint.
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || !live) return undefined;
    const { loop, still } = scene;
    let raf = 0;
    let last = 0;
    let elapsed = still;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // About 60 renders a second, also on 120 and 144 Hz screens.
      if (last && now - last < 12) return;
      if (last) elapsed = (elapsed + Math.min(0.1, (now - last) / 1000)) % loop;
      last = now;
      setClock(elapsed);
    };
    const io = new IntersectionObserver(
      (entries) => {
        cancelAnimationFrame(raf);
        last = 0;
        // A batch can hold several records for the drawing; the last one is its current state.
        if (entries[entries.length - 1].isIntersecting) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scene, live]);

  const comp = wide ? scene.wide : scene.phone;
  const t = live ? clock : scene.still;
  const f = frame(id);
  return (
    <div ref={box} aria-hidden style={f.style} className={cn(f.className, "select-none", className)}>
      {width > 0 ? (
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: comp.w, height: comp.h, transform: `scale(${width / comp.w})` }}>
          <DotGrid />
          {comp.draw(t)}
        </div>
      ) : null}
    </div>
  );
}
