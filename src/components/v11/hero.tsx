"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HERO, MEDIA } from "@/content/site";
import { ProblemTop } from "./problem-top";

/*
  v11 hero, after the client's first comment on v6: "this effect I like, the zoom effect ... only that video ... like
  full screen ... the bots, and then we're scrolling down, and it's moving to the second section ... only one time
  ... only the first hero section ... full screen, wide screen, maybe one header, or maybe the header down".

  The film fills the screen with nothing on it but the one headline, down at its foot, and the two main actions
  beside it. On phones and portrait tablets the film sits at the top, full width (so the robots are never cropped
  away), with the headline and the actions under it. One stage is held while you scroll ZOOM of a screen: the hero
  flies past (it grows and fades) and the second section, the top of v1's Problem section, comes up out of the depth
  into its place. That is the page's only zoom; from there the page simply scrolls on.

  Round 4 (the client's Loom of 2026-11-12): "Just put that CTA here away ... This is too much" (both actions go; the
  header keeps the one contact button), the headline "a little bit centralized", and "one level out that you can see
  my hair". The film's source has only about 5% of its height above his hair, and the header bar covered the top
  84px, so on desktop the film now starts under the bar (72px down, top-aligned) and its top edge fades into the
  film's own edge navy. Phones already had the film below the header.

  The film plays only while the hero can be seen. Reduced motion: no zoom and no film (the last frame stands), the
  hero and the Problem panel simply cross-fade.
*/

const EASE = [0.16, 1, 0.3, 1] as const;

/** The scroll, as a share of the screen height, over which the hero passes and the panel arrives. */
const ZOOM = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function HeroIntoProblem() {
  const stage = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const geo = useRef({ top: 0, vh: 900 });
  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [phase, setPhase] = useState<"hero" | "panel">("hero");

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const facts = el.querySelector<HTMLElement>("#problem dl");
    const measure = () => {
      const slot = el.parentElement;
      geo.current = { top: slot ? slot.getBoundingClientRect().top + window.scrollY : 0, vh: el.offsetHeight || window.innerHeight };
      /*
        v1's rhythm after the zoom (the developer: "the spacing seems off between sections, v1 had good"): the panel
        stands centred in the full-screen stage, so the half-screen under its facts would add to the gap before the
        next section. The runway's foot is pulled up by exactly that excess, leaving v1's 96px (64px on phones) under
        the facts before the next section's own padding. The stage still holds for the whole zoom (the runway keeps
        its height); the next section just follows on closer. Measured in layout (offsets), not in the zoom's scale.
      */
      if (slot && facts) {
        let bottom = facts.offsetHeight;
        for (let node: HTMLElement | null = facts; node && node !== el; node = node.offsetParent as HTMLElement | null) bottom += node.offsetTop;
        const keep = window.matchMedia("(min-width: 768px)").matches ? 96 : 64;
        slot.style.setProperty("--v11-pull", `${Math.max(0, Math.round(el.offsetHeight - bottom - keep))}px`);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (facts) ro.observe(facts);
    window.addEventListener("resize", measure);
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onQuery = () => setReduced(query.matches);
    onQuery();
    query.addEventListener("change", onQuery);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", measure);
      query.removeEventListener("change", onQuery);
    };
  }, []);

  const { scrollY } = useScroll();
  // How far the zoom has run.
  const zoom = useTransform(() => clamp01((scrollY.get() - geo.current.top) / (ZOOM * geo.current.vh)));

  // The hero is gone before the panel is more than faint, so the two never sit on each other as a double image.
  const heroScale = useTransform(() => 1 + 0.55 * smooth(zoom.get()));
  const heroOpacity = useTransform(() => 1 - clamp01((zoom.get() - 0.08) / 0.42));
  const panelScale = useTransform(() => 0.72 + 0.28 * smooth(clamp01((zoom.get() - 0.2) / 0.8)));
  const panelOpacity = useTransform(() => clamp01((zoom.get() - 0.34) / 0.42));

  // The panel takes over (pointer and focus) once it is most of the way in.
  useMotionValueEvent(zoom, "change", (z) => setPhase(z > 0.55 ? "panel" : "hero"));

  // The film plays only while the hero can be seen.
  const playing = onScreen && phase === "hero" && !reduced;
  useEffect(() => {
    const video = film.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  const line = (delay: number) => ({ initial: { y: "105%" }, animate: { y: "0%" }, transition: { duration: 1.1, delay, ease: EASE } });

  return (
    <div className="relative" style={{ height: `${100 + ZOOM * 100}svh`, marginBottom: "calc(-1 * var(--v11-pull, 0px))" }}>
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        {/* The second section, waiting in the depth behind the hero: the top of v1's Problem section. */}
        <motion.section
          id="problem"
          aria-label="Problem"
          inert={phase !== "panel"}
          style={{ scale: panelScale, opacity: panelOpacity }}
          className="absolute inset-0 z-[1] will-change-transform motion-reduce:!transform-none"
        >
          <ProblemTop active={phase === "panel"} />
        </motion.section>

        {/* The hero: the film over the whole screen, only the headline and the two actions at its foot. */}
        <motion.section
          id="top"
          inert={phase !== "hero"}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-[2] flex flex-col overflow-hidden bg-[linear-gradient(160deg,#0a2a62_0%,#061536_100%)] will-change-transform motion-reduce:!transform-none lg:bg-[#080d1b] lg:bg-none"
        >
          {/*
            Phones and tablets: the film fills the whole height between the header and the headline, so the screen has
            no empty foot on a tall phone (the developer: "too much bottom blank space when the page loads on mobile").
            Desktop: the film over the whole screen, as before.
          */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.1, ease: EASE }}
            className="v11-film-phone relative z-[2] mt-[72px] min-h-[96px] flex-1 lg:absolute lg:inset-x-0 lg:top-[72px] lg:bottom-0 lg:mt-0 lg:min-h-0 lg:[mask-image:linear-gradient(to_bottom,transparent_0,#000_28px)]"
          >
            <video
              ref={film}
              className="absolute inset-0 h-full w-full object-cover object-[50%_28%] motion-reduce:hidden lg:object-[50%_0%]"
              src={MEDIA.heroVideo}
              poster={MEDIA.heroPoster}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Roman Tränkle, Gründer von Branded Genius, mit zwei KI-Robotern"
            />
            <Image src="/media/hero-final.webp" alt="" fill sizes="100vw" className="hidden object-cover object-[50%_28%] motion-reduce:block lg:object-[50%_0%]" />
          </motion.div>
          {/* Desktop: a navy ground rises at the foot of the film so the headline reads. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[3] hidden h-[46%] bg-[linear-gradient(0deg,rgb(4_12_30/0.92)_0%,rgb(4_12_30/0.55)_45%,rgb(4_12_30/0)_100%)] lg:block"
          />

          {/* The headline, centred at the foot of the screen; on phones clear of the version pill below it. */}
          <div className="relative z-10 mx-auto flex w-full max-w-[1280px] shrink-0 flex-col px-5 pt-2 pb-16 md:px-8 lg:h-full lg:justify-end lg:pt-0 lg:pb-14">
            {/* "KI-Automatisierung," is 7.8em wide; the display scale keeps it on one line down to a 360px phone. */}
            <h1 className="t-display text-center">
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <motion.span className="block whitespace-nowrap" {...line(0.25)}>
                  {HERO.title}
                </motion.span>
              </span>
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.2em]">
                <motion.span className="block" {...line(0.38)}>
                  <span className="accent accent-sweep">{HERO.accent}</span>
                </motion.span>
              </span>
            </h1>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
