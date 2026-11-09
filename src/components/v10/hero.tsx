"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { HERO, LINKS, MEDIA } from "@/content/site";
import { ProblemTop } from "./problem-top";

/*
  v10 hero, after the client's first comment on v6: "this effect I like, the zoom effect ... only that video ... like
  full screen ... the bots, and then we're scrolling down, and it's moving to the second section ... only one time
  ... only the first hero section ... full screen, wide screen, maybe one header, or maybe the header down".

  The film fills the screen with nothing on it but the one headline, down at its foot, and the two main actions
  beside it. On phones and portrait tablets the film sits at the top, full width (so the robots are never cropped
  away), with the headline and the actions under it. One stage is held while you scroll ZOOM of a screen: the hero
  flies past (it grows and fades) and the second section, the top of v1's Problem section, comes up out of the depth
  into its place. That is the page's only zoom. Then, as everywhere on the page, the next sheet slides up over it.

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
    const measure = () => {
      const slot = el.parentElement;
      geo.current = { top: slot ? slot.getBoundingClientRect().top + window.scrollY : 0, vh: el.offsetHeight || window.innerHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
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
  const fade = (delay: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: EASE } });

  return (
    <div className="v10-hero relative z-[1]" style={{ height: `${200 + ZOOM * 100}svh` }}>
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        {/* The second section, waiting in the depth behind the hero: the top of v1's Problem section. */}
        <motion.section
          id="problem"
          aria-label="Problem"
          inert={phase !== "panel"}
          style={{ scale: panelScale, opacity: panelOpacity }}
          className="v10-sheet absolute inset-[var(--v10-gap)] z-[1] will-change-transform motion-reduce:!transform-none"
        >
          <div aria-hidden className="v10-bg">
            <div className="v10-light" data-light="b" />
          </div>
          <div className="relative z-10 h-full">
            <ProblemTop />
          </div>
        </motion.section>

        {/* The hero: the film over the whole screen, only the headline and the two actions at its foot. */}
        <motion.section
          id="top"
          inert={phase !== "hero"}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-[2] overflow-hidden bg-[#040c1e] will-change-transform motion-reduce:!transform-none"
        >
          <div aria-hidden className="v10-bg">
            <div className="v10-light" data-light="a" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.1, ease: EASE }}
            className="v10-film-phone absolute inset-x-0 top-[72px] z-[2] h-[min(75vw,40svh)] lg:inset-0 lg:h-auto"
          >
            <video
              ref={film}
              className="absolute inset-0 h-full w-full object-cover object-[50%_28%] motion-reduce:hidden"
              src={MEDIA.heroVideo}
              poster={MEDIA.heroPoster}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Roman Tränkle, Gründer von Branded Genius, mit zwei KI-Robotern"
            />
            <Image src="/media/hero-final.webp" alt="" fill sizes="100vw" className="hidden object-cover object-[50%_28%] motion-reduce:block" />
          </motion.div>
          {/* Desktop: a navy ground rises at the foot of the film so the headline reads. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[3] hidden h-[46%] bg-[linear-gradient(0deg,rgb(4_12_30/0.92)_0%,rgb(4_12_30/0.55)_45%,rgb(4_12_30/0)_100%)] lg:block"
          />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col px-5 pt-[calc(72px_+_min(75vw,40svh)_+_8px)] md:px-8 lg:justify-end lg:pt-0 lg:pb-14">
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
              {/* "KI-Automatisierung," is 7.8em wide; the display scale keeps it on one line down to a 360px phone. */}
              <h1 className="t-display">
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
              <motion.div className="mt-7 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:shrink-0 lg:gap-3 lg:pb-1.5" {...fade(0.7)}>
                <PrimaryLink href={LINKS.analysis} size="lg">
                  {HERO.primary}
                </PrimaryLink>
                <SecondaryLink href={LINKS.booking} size="lg">
                  {HERO.secondary}
                </SecondaryLink>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
