"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { HERO, LINKS, MEDIA } from "@/content/site";
import { ProblemPanel } from "./problem";

/*
  v10 hero, after the client's first comment: "this effect I like, the zoom effect" (v6), "only that video ... full
  screen, wide screen ... maybe the header down", and "only one time ... only the first hero section".

  The film fills the screen (on phones and portrait tablets it sits at the top, full width, so the robots are never
  cropped away) with the headline at its foot. One stage is held while you scroll ZOOM of a screen: the hero flies
  past (it grows and fades) and the Problem panel comes up out of the depth into its place. That is the page's only
  zoom. Then, as everywhere on the page, the next sheet slides up over the panel while it sinks back and darkens.

  The film plays only while the hero can be seen. Reduced motion: no zoom and no film (the last frame stands), the
  hero and the panel simply cross-fade.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;

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
  // How far the zoom has run, and how far the next sheet has covered the panel after it.
  const zoom = useTransform(() => clamp01((scrollY.get() - geo.current.top) / (ZOOM * geo.current.vh)));
  const cover = useTransform(() => clamp01((scrollY.get() - geo.current.top - ZOOM * geo.current.vh) / geo.current.vh));

  const heroScale = useTransform(() => 1 + 0.55 * smooth(zoom.get()));
  // The hero is gone before the panel is more than faint, so the two never sit on each other as a double image.
  const heroOpacity = useTransform(() => 1 - clamp01((zoom.get() - 0.08) / 0.42));
  const panelScale = useTransform(() => {
    const arrive = smooth(clamp01((zoom.get() - 0.2) / 0.8));
    return (0.72 + 0.28 * arrive) * (1 - 0.05 * cover.get());
  });
  const panelOpacity = useTransform(() => clamp01((zoom.get() - 0.34) / 0.42));
  const panelOrigin = useTransform(() => (cover.get() > 0 ? "50% 0%" : "50% 50%"));
  const shade = useTransform(() => 0.6 * cover.get());

  // The panel takes over (pointer, focus, its reasons' advance) once it is most of the way in, until it is covered.
  const sync = () => setPhase(zoom.get() > 0.55 && cover.get() < 1 ? "panel" : "hero");
  useMotionValueEvent(zoom, "change", sync);
  useMotionValueEvent(cover, "change", sync);

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
        {/* The Problem panel, waiting in the depth behind the hero. */}
        <motion.section
          id="problem"
          aria-label="Problem"
          inert={phase !== "panel"}
          style={{ scale: panelScale, opacity: panelOpacity, transformOrigin: panelOrigin }}
          className="v10-sheet absolute inset-[var(--v10-gap)] z-[1] will-change-transform motion-reduce:!transform-none"
        >
          <div aria-hidden className="v10-bg">
            <div className="v10-light" data-light="b" />
            <div className="v10-grain" />
          </div>
          <ProblemPanel live={phase === "panel" && onScreen} />
          <motion.div aria-hidden style={{ opacity: shade }} className="v10-shade" />
        </motion.section>

        {/* The hero: the film over the whole screen, the headline at its foot. */}
        <motion.section
          id="top"
          inert={phase !== "hero"}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-[2] overflow-hidden bg-[#040c1e] will-change-transform motion-reduce:!transform-none"
        >
          <div aria-hidden className="v10-bg">
            <div className="v10-light" data-light="a" />
            <div className="v10-grain" />
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
          {/* Desktop: a navy ground rises behind the headline so it reads over the film. */}
          <div
            aria-hidden
            className="absolute inset-0 z-[3] hidden bg-[linear-gradient(0deg,rgb(4_12_30/0.94)_0%,rgb(4_12_30/0.6)_26%,rgb(4_12_30/0)_52%),linear-gradient(90deg,rgb(4_12_30/0.35)_0%,rgb(4_12_30/0)_40%)] lg:block"
          />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col px-5 pt-[calc(72px_+_min(75vw,40svh)_-_12px)] md:px-8 lg:justify-end lg:pt-0 lg:pb-12">
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
              <div className="max-w-[640px]">
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
                <motion.p className="t-lead mt-4 max-w-[520px] lg:mt-5 [@media(max-height:700px)_and_(max-width:1023px)]:hidden" {...fade(0.6)}>
                  {LEAD}
                </motion.p>
              </div>
              <motion.div className="mt-6 flex flex-col gap-2.5 sm:flex-row lg:mt-0 lg:shrink-0 lg:gap-3" {...fade(0.75)}>
                <PrimaryLink href={LINKS.analysis} size="lg" className="h-12 px-6 text-[15px] lg:h-14 lg:px-8 lg:text-[16px]">
                  {HERO.primary}
                </PrimaryLink>
                <SecondaryLink href={LINKS.booking} size="lg" className="h-12 px-6 text-[15px] lg:h-14 lg:px-8 lg:text-[16px]">
                  {HERO.secondary}
                </SecondaryLink>
              </motion.div>
            </div>

            <motion.p {...fade(1)} className="mt-10 hidden items-center gap-5 border-t border-white/10 pt-5 text-[15px] text-white/60 lg:flex">
              {HERO.claim.map((word, i) => (
                <span key={word} className="flex items-center gap-5">
                  {i > 0 && <span aria-hidden className="h-3.5 w-px bg-white/20" />}
                  {word}
                </span>
              ))}
            </motion.p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
