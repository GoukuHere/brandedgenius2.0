"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ServiceAnimation, isSceneId } from "@/components/sections/service-scenes";
import { Heading } from "@/components/system/primitives";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, HERO, LINKS, PROBLEM, REALITY, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { ConceptHeader, ConceptLink, Grain, HeroFilm, LegalLine, useReducedMotion } from "../shared";

/*
  Concept 1, "Kapitel" (2026-11-07). The homepage as a short run of full-screen chapters instead of a long run of
  sections. Each chapter is one panel with its own deep blue light; it pins, its content steps through while you
  scroll (the claim words, the six reasons, the four services, the six case studies), then the next chapter slides
  up over it while it shrinks back and darkens, like a stack of cards. One idea per screen, little text, the brand
  blues as gradients with grain.

  Mechanics: every chapter sits in a slot. A slot is the panel's own screen, plus the scroll distance its content
  steps through (DWELL, in pixels), plus one more screen in which the next chapter rises over it (the next slot is
  pulled up by one screen to overlap it). The panel is sticky inside its slot, so it stays put until it is covered.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

type ChapterId = "top" | "problem" | "leistungen" | "fallstudien";
type Chapter = { id: ChapterId; label: string; dwell: number };

const CHAPTERS: Chapter[] = [
  { id: "top", label: "Start", dwell: 560 },
  { id: "problem", label: "Problem", dwell: REALITY.items.length * 230 },
  { id: "leistungen", label: "Leistungen", dwell: SERVICES.items.length * 300 },
  { id: "fallstudien", label: "Fallstudien", dwell: CASES.items.length * 230 },
];

/* Each chapter's light: deep navy, a royal field, a smaller sky light, from a different side each time. */
const LIGHT: Record<ChapterId, { base: string; glow: string }> = {
  top: {
    base: "radial-gradient(60% 75% at 74% 58%, rgb(0 75 160 / 0.7), rgb(0 75 160 / 0) 72%), radial-gradient(55% 60% at 0% 0%, rgb(26 111 224 / 0.16), rgb(26 111 224 / 0) 70%), linear-gradient(180deg, #071737 0%, #040c1e 100%)",
    glow: "radial-gradient(26% 32% at 76% 50%, rgb(105 191 248 / 0.26), rgb(105 191 248 / 0) 72%)",
  },
  problem: {
    base: "radial-gradient(62% 78% at 0% 0%, rgb(0 75 160 / 0.62), rgb(0 75 160 / 0) 72%), radial-gradient(48% 60% at 100% 100%, rgb(0 75 160 / 0.5), rgb(0 75 160 / 0) 72%), linear-gradient(155deg, #081b40 0%, #030a18 100%)",
    glow: "radial-gradient(28% 34% at 22% 30%, rgb(105 191 248 / 0.16), rgb(105 191 248 / 0) 72%)",
  },
  leistungen: {
    base: "radial-gradient(58% 80% at 100% 12%, rgb(0 75 160 / 0.72), rgb(0 75 160 / 0) 72%), radial-gradient(50% 50% at 10% 100%, rgb(26 111 224 / 0.3), rgb(26 111 224 / 0) 72%), linear-gradient(205deg, #09224f 0%, #040c1d 100%)",
    glow: "radial-gradient(30% 36% at 82% 26%, rgb(105 191 248 / 0.22), rgb(105 191 248 / 0) 72%)",
  },
  fallstudien: {
    base: "radial-gradient(85% 70% at 50% 112%, rgb(26 111 224 / 0.78), rgb(26 111 224 / 0) 72%), radial-gradient(60% 55% at 100% 0%, rgb(0 75 160 / 0.45), rgb(0 75 160 / 0) 72%), linear-gradient(180deg, #04102b 0%, #072a60 100%)",
    glow: "radial-gradient(40% 34% at 50% 100%, rgb(105 191 248 / 0.3), rgb(105 191 248 / 0) 72%)",
  },
};

/** The chapter's light: the field, a sky light that drifts with the chapter's progress, the grain. */
function Light({ id, drift, from, to }: { id: ChapterId; drift: MotionValue<number>; from: [string, string]; to: [string, string] }) {
  const x = useTransform(drift, [0, 1], [from[0], to[0]]);
  const y = useTransform(drift, [0, 1], [from[1], to[1]]);
  return (
    <>
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: LIGHT[id].base }} />
      <motion.div aria-hidden className="absolute -inset-[12%]" style={{ x, y, backgroundImage: LIGHT[id].glow }} />
      <Grain />
    </>
  );
}

/** The index a chapter's progress has reached, out of `count` steps. */
function useStep(progress: MotionValue<number>, count: number) {
  const [step, setStep] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setStep(Math.min(count - 1, Math.floor(v * count))));
  return step;
}

/** Thin bars, one per step: done ones full, the current one filling with the scroll. */
function StepBars({ progress, count, className }: { progress: MotionValue<number>; count: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex gap-1.5", className)}>
      {Array.from({ length: count }, (_, i) => (
        <StepBar key={i} progress={progress} count={count} index={i} />
      ))}
    </div>
  );
}
function StepBar({ progress, count, index }: { progress: MotionValue<number>; count: number; index: number }) {
  const fill = useTransform(progress, (v) => clamp01(v * count - index));
  return (
    <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/12">
      <motion.span className="absolute inset-0 origin-left bg-sky" style={{ scaleX: fill }} />
    </span>
  );
}

/* ---------- The chapters ---------- */

const LEAD = `${HERO.text.split(" für ")[0]}.`;

function StartChapter({ progress }: { progress: MotionValue<number> }) {
  const word = useStep(progress, HERO.claim.length);
  const filmScale = useTransform(progress, [0, 1], [1, 1.06]);
  return (
    <>
      <Light id="top" drift={progress} from={["0%", "0%"]} to={["-6%", "4%"]} />
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.1, ease: EASE }}
        className="absolute inset-x-0 top-[64px] z-[2] aspect-video md:inset-x-auto md:top-1/2 md:right-[-5%] md:w-[min(66%,1180px)] md:-translate-y-1/2"
      >
        <motion.div style={{ scale: filmScale }} className="absolute inset-0">
          <HeroFilm className="c1-film absolute inset-0" sizes="(min-width: 768px) 66vw, 100vw" />
        </motion.div>
      </motion.div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col px-6 pt-[calc(56vw+40px)] pb-[96px] md:justify-center md:px-12 md:pt-[88px] md:pb-[120px]">
        <div className="max-w-[600px]">
          <Heading as="h1" size="display" title={HERO.title} accent={HERO.accent} />
          <p data-reveal="up" data-rd="3" className="t-lead mt-6 max-w-[500px]">
            {LEAD}
          </p>
          <div data-reveal="up" data-rd="4" className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ConceptLink href={LINKS.analysis}>{HERO.primary}</ConceptLink>
            <ConceptLink href={LINKS.booking} variant="ghost">
              {HERO.secondary}
            </ConceptLink>
          </div>
        </div>
      </div>

      {/* The claim, one word lit at a time as the chapter scrolls. */}
      <p className="absolute bottom-[86px] left-6 z-10 flex flex-wrap gap-x-5 gap-y-1 md:bottom-[104px] md:left-12">
        {HERO.claim.map((w, i) => (
          <span
            key={w}
            className={cn(
              "text-[22px] font-medium tracking-[-0.02em] transition-colors duration-700 md:text-[34px]",
              i === word ? "text-white" : "text-white/22"
            )}
          >
            {w}
          </span>
        ))}
      </p>
    </>
  );
}

function ProblemChapter({ progress }: { progress: MotionValue<number> }) {
  const reasons = REALITY.items;
  const active = useStep(progress, reasons.length);
  const reason = reasons[active];
  return (
    <>
      <Light id="problem" drift={progress} from={["0%", "0%"]} to={["10%", "16%"]} />
      {/* Desktop: the photos fill the right of the panel and dissolve into its light. */}
      <div className="c1-photo-fade absolute inset-y-0 right-0 z-[2] hidden w-[58%] md:block">
        <ReasonPhotos active={active} sizes="58vw" />
      </div>
      <div className="relative z-10 mx-auto grid h-full max-w-[1360px] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-6 px-6 pt-[84px] pb-[92px] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:items-center md:gap-16 md:px-12 md:pt-[96px] md:pb-[112px]">
        <div className="md:self-center">
          <Heading title={PROBLEM.title} accent={PROBLEM.accent} />
          <div className="mt-8 hidden md:block">
            <StepBars progress={progress} count={reasons.length} />
            <ReasonText index={active} title={reason.title} text={reason.text} />
          </div>
        </div>

        {/* Phones: the photo in a frame between the headline and the reason. */}
        <div data-reveal="photo" className="relative min-h-0 overflow-hidden rounded-[16px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.09)] md:hidden">
          <ReasonPhotos active={active} sizes="100vw" />
        </div>

        <div className="md:hidden">
          <StepBars progress={progress} count={reasons.length} />
          <ReasonText index={active} title={reason.title} text={reason.text} compact />
        </div>
      </div>
    </>
  );
}

/** The six reasons' photos, one shown at a time, under a royal grade so each sits in the chapter's light. */
function ReasonPhotos({ active, sizes }: { active: number; sizes: string }) {
  return (
    <>
      {REALITY.items.map((r, i) => (
        <Image
          key={r.img}
          src={r.img}
          alt={i === active ? r.title : ""}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-[opacity,scale] duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
          )}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(3_10_26/0.6)_0%,rgb(3_10_26/0)_45%),linear-gradient(0deg,rgb(0_75_160/0.24),rgb(0_75_160/0.24))]"
      />
    </>
  );
}

function ReasonText({ index, title, text, compact = false }: { index: number; title: string; text: string; compact?: boolean }) {
  return (
    <div className={cn("relative", compact ? "mt-4 min-h-[118px]" : "mt-6 min-h-[150px]")}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="num text-[15px] text-sky">{String(index + 1).padStart(2, "0")}</p>
          <h3 className={cn("mt-2 font-medium tracking-[-0.015em] text-white", compact ? "text-[21px] leading-[1.2]" : "text-[26px] leading-[1.2]")}>{title}</h3>
          <p className={cn("mt-2 max-w-[460px] text-white/68", compact ? "text-[15px] leading-[1.5]" : "text-[17px] leading-[1.6]")}>{text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ServicesChapter({ progress }: { progress: MotionValue<number> }) {
  const items = SERVICES.items;
  const step = useStep(progress, items.length);
  const [picked, setPicked] = useState<{ index: number; at: number } | null>(null);
  // A click opens a service until the scroll moves on to another step.
  const active = picked && picked.at === step ? picked.index : step;
  return (
    <>
      <Light id="leistungen" drift={progress} from={["0%", "0%"]} to={["-8%", "10%"]} />
      <div className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col px-6 pt-[84px] pb-[92px] md:px-12 md:pt-[100px] md:pb-[112px]">
        <div className="flex items-end justify-between gap-12">
          <Heading title={SERVICES.title} accent={SERVICES.accent} />
          <p data-reveal="up" data-rd="2" className="t-body hidden max-w-[400px] lg:block">
            {SERVICES.text}
          </p>
        </div>
        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-2 md:mt-10 md:flex-row md:gap-3">
          {items.map((item, i) => {
            const open = i === active;
            const scene = isSceneId(item.id) ? item.id : null;
            return (
              <motion.div
                key={item.id}
                animate={{ flexGrow: open ? 3 : 1 }}
                transition={{ duration: 0.85, ease: EASE }}
                style={{ flexBasis: 0 }}
                className={cn(
                  "relative isolate flex min-h-[58px] min-w-0 flex-col overflow-hidden rounded-[18px] transition-[background-color,box-shadow] duration-700",
                  open
                    ? "bg-[linear-gradient(160deg,rgb(0_75_160/0.55),rgb(4_14_34/0.35)_70%)] shadow-[inset_0_0_0_1px_rgb(105_191_248/0.35),0_30px_60px_-30px_rgb(0_0_0/0.8)]"
                    : "bg-white/[0.035] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] hover:bg-white/[0.06]"
                )}
              >
                {/* Closed (desktop): the number and an open mark at the top, the title at the foot. */}
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setPicked({ index: i, at: step })}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-4 p-4 text-left md:flex-col md:p-5 xl:p-6",
                    open ? "shrink-0 md:gap-3" : "min-h-0 flex-1 md:justify-between"
                  )}
                >
                  <span className="flex items-center justify-between gap-3 md:w-full">
                    <span className={cn("num text-[15px] transition-colors duration-500", open ? "text-sky" : "text-white/40")}>{String(i + 1).padStart(2, "0")}</span>
                    {!open && <Plus aria-hidden className="hidden size-4 text-white/45 md:block" />}
                  </span>
                  <span
                    className={cn(
                      "text-[18px] leading-[1.25] font-medium tracking-[-0.01em] [hyphens:manual] md:text-[19px] xl:text-[21px]",
                      open ? "text-white" : "text-white/80"
                    )}
                  >
                    {item.title}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.25, ease: EASE } }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      className="flex min-h-0 flex-1 flex-col px-4 pb-4 md:px-6 md:pb-6"
                    >
                      <p className="max-w-[520px] text-[15px] leading-[1.55] text-white/72 md:text-[16px]">{item.text}</p>
                      {scene && (
                        <div className="mt-auto pt-5">
                          <div className="c1-scene hidden overflow-hidden rounded-[12px] bg-[#071a3d] shadow-[inset_0_0_0_1px_rgb(105_191_248/0.14)] sm:block">
                            <ServiceAnimation id={scene} playing />
                          </div>
                        </div>
                      )}
                      <a
                        href={LINKS.contact}
                        target="_blank"
                        rel="noopener"
                        className="mt-4 inline-flex w-fit items-center gap-1.5 text-[15px] font-medium text-white transition-colors hover:text-sky"
                      >
                        {item.cta}
                        <ArrowUpRight className="size-4" />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function CasesChapter({ progress }: { progress: MotionValue<number> }) {
  const items = CASES.items;
  const step = useStep(progress, items.length);
  const [picked, setPicked] = useState<{ index: number; at: number } | null>(null);
  const active = picked && picked.at === step ? picked.index : step;
  const study = items[active];
  return (
    <>
      <Light id="fallstudien" drift={progress} from={["-6%", "0%"]} to={["6%", "-6%"]} />
      <div className="relative z-10 mx-auto flex h-full max-w-[1360px] flex-col px-6 pt-[84px] pb-[92px] md:px-12 md:pt-[100px] md:pb-[112px]">
        <div className="flex items-end justify-between gap-12">
          <Heading title={CASES.title} accent={CASES.accent} />
          <p data-reveal="up" data-rd="2" className="t-body hidden max-w-[420px] lg:block">
            {CASES.text}
          </p>
        </div>

        <div role="tablist" aria-label="Fallstudien" className="mt-6 grid grid-cols-3 gap-x-3 gap-y-1 border-b border-white/10 md:mt-10 md:flex md:gap-10">
          {items.map((c, i) => (
            <button
              key={c.area}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setPicked({ index: i, at: step })}
              className="relative cursor-pointer pt-1 pb-3 text-left"
            >
              <span className={cn("block text-[14px] font-medium transition-colors md:text-[15px]", i === active ? "text-white" : "text-white/50 hover:text-white/80")}>{c.area}</span>
              <span className="hidden text-[13px] text-silver md:block">{c.kind}</span>
              {i === active && <motion.span layoutId="c1-case-line" className="absolute right-0 -bottom-px left-0 h-[2px] bg-sky" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            className="mt-6 grid min-h-0 flex-1 content-start gap-8 md:mt-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-14"
          >
            <div>
              <p className="text-[20px] leading-[1.25] font-medium tracking-[-0.015em] text-white md:text-[28px]">{study.tagline}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-9 md:gap-8">
                {study.metrics.map((m, k) => (
                  <div key={m.label} className="flex items-baseline gap-4 sm:block">
                    <span className="block w-[104px] shrink-0 overflow-hidden pb-[0.06em] sm:w-auto">
                      <motion.span
                        initial={{ y: "105%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.9, delay: 0.08 + k * 0.09, ease: EASE }}
                        className="num block text-[40px] leading-none text-white sm:text-[clamp(52px,5.4vw,84px)]"
                      >
                        {m.value}
                      </motion.span>
                    </span>
                    <p className="min-w-0 flex-1 text-[14px] leading-[1.45] text-white/62 sm:mt-3 sm:max-w-[230px] md:text-[15px]">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <figure className="hidden border-l border-white/12 pl-8 lg:block">
              <blockquote className="text-[18px] leading-[1.6] text-white/85">„{study.quote}“</blockquote>
              <figcaption className="mt-4 text-[14px] text-silver">{study.role}</figcaption>
            </figure>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

const RENDER: Record<ChapterId, (progress: MotionValue<number>) => ReactNode> = {
  top: (p) => <StartChapter progress={p} />,
  problem: (p) => <ProblemChapter progress={p} />,
  leistungen: (p) => <ServicesChapter progress={p} />,
  fallstudien: (p) => <CasesChapter progress={p} />,
};

/* ---------- The stack ---------- */

function Slot({ chapter, index, last }: { chapter: Chapter; index: number; last: boolean }) {
  const slot = useRef<HTMLElement>(null);
  const at = useRef({ top: 0, vh: 900 });
  useEffect(() => {
    const measure = () => {
      const el = slot.current;
      if (!el) return;
      at.current = { top: el.getBoundingClientRect().top + window.scrollY, vh: window.innerHeight };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // How far the chapter's own content has stepped, how far the next chapter has covered it, how far it has arrived.
  const progress = useTransform(scrollY, (y) => clamp01((y - at.current.top) / chapter.dwell));
  const cover = useTransform(scrollY, (y) => (last ? 0 : clamp01((y - at.current.top - chapter.dwell) / at.current.vh)));
  const arrive = useTransform(scrollY, (y) => (index === 0 ? 1 : clamp01((y - at.current.top + at.current.vh) / at.current.vh)));
  const scale = useTransform(() => (0.95 + 0.05 * easeOut(arrive.get())) * (1 - 0.075 * cover.get()));
  const tilt = useTransform(() => 7 * (1 - easeOut(arrive.get())));
  const lift = useTransform(() => -36 * cover.get());
  const shade = useTransform(() => 0.72 * cover.get());
  // Arriving, the panel lands on its bottom edge; covered, it shrinks back towards its top edge. The two never
  // overlap (between them the panel is untransformed), so the switch is invisible.
  const origin = useTransform(() => (cover.get() > 0 ? "50% 0%" : "50% 100%"));

  const style: CSSProperties = {
    height: last ? `calc(100svh + ${chapter.dwell}px)` : `calc(200svh + ${chapter.dwell}px)`,
    marginTop: index ? "-100svh" : undefined,
    zIndex: index + 1,
  };
  return (
    <section ref={slot} id={chapter.id} aria-label={chapter.label} data-chapter={index} data-dwell={chapter.dwell} className="relative" style={style}>
      <div className="sticky top-0 h-svh [perspective:2200px]">
        <motion.div className="c1-panel" style={reduced ? undefined : { scale, rotateX: tilt, y: lift, transformOrigin: origin }}>
          {RENDER[chapter.id](progress)}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-40 bg-[#01040b]" style={{ opacity: shade }} />
        </motion.div>
      </div>
    </section>
  );
}

/** The chapter bar: where you are in the stack, each chapter's progress, and a jump to any chapter. */
function ChapterBar() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(true);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const slots = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
      let current = 0;
      let end = 0;
      slots.forEach((slot, i) => {
        const top = slot.getBoundingClientRect().top + y;
        if (y >= top - vh * 0.5) current = i;
        end = top + slot.offsetHeight;
        const dwell = Number(slot.dataset.dwell) || 1;
        const fill = fills.current[i];
        if (fill) fill.style.transform = `scaleX(${clamp01((y - top) / dwell)})`;
      });
      setActive(current);
      setShown(y < end - vh * 1.15);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jump = (index: number) => {
    const slot = document.querySelector<HTMLElement>(`[data-chapter="${index}"]`);
    if (!slot) return;
    window.scrollTo({ top: slot.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Kapitel"
      className={cn(
        "fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-[opacity,translate] duration-500 md:bottom-6",
        shown ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ol className="flex items-stretch gap-1 rounded-[14px] bg-[rgb(3_9_22/0.62)] p-1.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1),0_18px_40px_-18px_rgb(0_0_0/0.9)] backdrop-blur-md">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => jump(i)}
              aria-current={i === active ? "step" : undefined}
              className={cn(
                "relative flex h-10 cursor-pointer items-center gap-2 rounded-[10px] px-3 text-[13px] transition-colors md:px-4 md:text-[14px]",
                i === active ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white/85"
              )}
            >
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className={cn(i === active ? "inline" : "hidden md:inline")}>{c.label}</span>
              <span className="absolute right-3 bottom-1.5 left-3 h-px overflow-hidden bg-white/10 md:right-4 md:left-4">
                <span
                  ref={(el) => {
                    fills.current[i] = el;
                  }}
                  className="absolute inset-0 origin-left bg-sky"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** After the stack: the closing call to action and the legal line. */
function Closing() {
  return (
    <section className="relative z-[20] px-[5px] pt-[5px] pb-[5px] md:px-2 md:pt-2 md:pb-2">
      <div className="relative isolate overflow-hidden rounded-[20px] md:rounded-[26px]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(70% 90% at 85% 110%, rgb(105 191 248 / 0.38), rgb(105 191 248 / 0) 70%), radial-gradient(80% 100% at 10% -10%, rgb(0 75 160 / 0.75), rgb(0 75 160 / 0) 70%), linear-gradient(160deg, #0a2a62 0%, #061536 100%)",
          }}
        />
        <Grain />
        <div className="relative z-10 mx-auto max-w-[1360px] px-6 pt-20 pb-10 md:px-12 md:pt-28">
          <Heading title={CTA.title} accent={CTA.accent} className="max-w-[760px]" />
          <div data-reveal="up" data-rd="3" className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ConceptLink href={LINKS.contact}>{CTA.primary}</ConceptLink>
            <ConceptLink href={LINKS.booking} variant="ghost">
              {CTA.secondary}
            </ConceptLink>
          </div>
          <LegalLine className="mt-20 border-t border-white/10 pt-6 md:mt-28" />
        </div>
      </div>
    </section>
  );
}

export function ChaptersConcept() {
  return (
    <>
      <ConceptHeader />
      <main>
        <div className="c-root">
          {CHAPTERS.map((chapter, i) => (
            <Slot key={chapter.id} chapter={chapter} index={i} last={i === CHAPTERS.length - 1} />
          ))}
          <Closing />
        </div>
      </main>
      <ChapterBar />
      <RevealObserver />
      <SmoothScroll />
    </>
  );
}
