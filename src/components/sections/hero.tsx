"use client";

import { motion, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import { useSectionProgress } from "@/components/system/use-section-progress";
import { HERO, LINKS, MEDIA } from "@/content/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
  The client's own hero film: Roman alone, then two robots materialise beside him. It plays once and stays on the
  last frame, so the reveal is the moment and the hero then rests. The film has a near-black navy background, so
  its edges dissolve into the page background instead of showing a video rectangle.

  Reduced motion is handled without changing the markup (so the server HTML always matches): MotionProvider skips
  the movement, CSS (motion-reduce:) shows the film's last frame as a still and cancels the scroll drift, and an
  effect stops playback.
*/
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) film.current?.pause();
  }, []);

  // While the hero scrolls away, the film drifts up a little slower than the page and dims.
  const progress = useSectionProgress(section, ["start start", "end start"]);
  const filmY = useTransform(progress, [0, 1], [0, 110]);
  const filmOpacity = useTransform(progress, [0, 0.85], [1, 0.3]);

  const line = (delay: number) => ({
    initial: { y: "105%" },
    animate: { y: "0%" },
    transition: { duration: 1.1, delay, ease: EASE },
  });
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section ref={section} id="top" className="relative overflow-hidden">
      <motion.div
        style={{ y: filmY, opacity: filmOpacity }}
        className="hero-film pointer-events-none relative mx-auto mt-24 aspect-[5/4] w-full motion-reduce:!transform-none motion-reduce:!opacity-100 sm:aspect-video lg:absolute lg:top-[12svh] lg:right-[-7vw] lg:mt-0 lg:w-[64vw] lg:max-w-[1240px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.1, ease: EASE }}
          className="absolute inset-0"
        >
          <video
            ref={film}
            className="absolute inset-0 h-full w-full object-cover"
            src={MEDIA.heroVideo}
            poster={MEDIA.heroPoster}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label="Roman Tränkle, Gründer von Branded Genius, mit zwei KI-Robotern"
          />
          <Image
            src="/media/hero-final.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="hidden object-cover motion-reduce:block"
          />
        </motion.div>
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col px-5 pb-20 md:px-8 lg:min-h-[100svh] lg:justify-center lg:pt-28 lg:pb-24">
        <div className="-mt-10 max-w-[600px] sm:-mt-16 lg:mt-0">
          {/* "KI-Automatisierung," is 7.8em wide; the display scale keeps it on one line down to a 360px phone. */}
          <h1 className="t-display">
            {/* Each line is masked for the rise; the padding (taken back by the negative margin) keeps descenders whole. */}
            <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
              <motion.span className="block whitespace-nowrap" {...line(0.25)}>
                {HERO.title}
              </motion.span>
            </span>
            <span className="-mb-[0.12em] block overflow-hidden pb-[0.2em]">
              <motion.span className="block" {...line(0.38)}>
                <span className="accent">{HERO.accent}</span>
              </motion.span>
            </span>
          </h1>
          <motion.p className="t-lead mt-6 max-w-[520px]" {...fade(0.6)}>
            {HERO.text}
          </motion.p>
          <motion.div className="mt-9 flex flex-col gap-3 sm:flex-row" {...fade(0.75)}>
            <PrimaryLink href={LINKS.analysis} size="lg">
              {HERO.primary}
            </PrimaryLink>
            <SecondaryLink href={LINKS.booking} size="lg">
              {HERO.secondary}
            </SecondaryLink>
          </motion.div>
        </div>

        <motion.p {...fade(1)} className="mt-14 flex items-center gap-5 text-[15px] text-ink/55 lg:absolute lg:bottom-10 lg:mt-0">
          {HERO.claim.map((word, i) => (
            <span key={word} className="flex items-center gap-5">
              {i > 0 && <span aria-hidden className="h-3.5 w-px bg-white/15" />}
              {word}
            </span>
          ))}
        </motion.p>
      </div>
    </section>
  );
}
