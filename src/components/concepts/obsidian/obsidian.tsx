"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, FOOTER, HEADER, HERO, LINKS, NAV, PROBLEM, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { StageGuard, useWebGL } from "../crystal/webgl";
import { RevealWords, useReducedMotion } from "../shared";
import { SHARD_SLOTS_DESK } from "./slots";

/*
  Version v9, "Obsidian" (2026-11-07), the dark one of the two glass versions the developer asked for ("super
  futuristic and stunning, award winning, glass, 3D, totally new"). Where v8 is a white gallery with an object that
  travels beside the text, this is a dark stage with the object in the middle and the words placed around it, like
  a keynote: the headline splits across the screen, one line above the glass and one below.

  The object is a thick pane of glass that is a transparent display (scene.tsx): the founder's film plays inside it,
  it breaks into six shards for the six problems (each labelled here, at the shard's place), it opens into four
  etched layers for the services, and it shows each case's results. Type: Hubot Sans, set wide for headlines.
  Colour: the room's near-black, light columns of royal and sky, off-white type, the sky for accents.
*/

const Stage = dynamic(() => import("./scene").then((m) => m.ObsidianStage), {
  ssr: false,
});
const EXT = { target: "_blank", rel: "noopener" } as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;

function Btn({
  href,
  children,
  glass = false,
  small = false,
  className,
}: {
  href: string;
  children: ReactNode;
  glass?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <a href={href} {...EXT} className={cn("k9-btn group", glass ? "k9-btn-glass" : "k9-btn-ice", small && "k9-btn-sm", className)}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function Header() {
  const contact = NAV.find((item) => item.href === "#kontakt")?.label ?? "Kontakt";
  return (
    <>
      <div aria-hidden className="k9-headband" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:h-[88px] md:px-12">
          <a href="#top" aria-label="Branded Genius, zum Anfang" className="pointer-events-auto block h-[24px] md:h-[28px]">
            <BrandLogo />
          </a>
          <Btn href={LINKS.contact} small glass className="pointer-events-auto">
            <span className="hidden sm:inline">{HEADER.cta}</span>
            <span className="sm:hidden">{contact}</span>
          </Btn>
        </div>
      </header>
    </>
  );
}

/** A pinned stage: the section is `height` tall, its inner screen holds while the section passes. */
function useStage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  return { ref, progress: scrollYProgress };
}

function useStep(progress: MotionValue<number>, count: number) {
  const [step, setStep] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setStep(Math.min(count - 1, Math.max(0, Math.floor(v * count)))));
  return step;
}

function Hero() {
  return (
    <section data-k9="hero" id="top" className="relative">
      <div className="relative mx-auto h-[100svh] min-h-[600px] max-w-[1440px] px-6 md:px-12">
        <h1 data-reveal="heading" className="k9-h1 absolute inset-x-6 top-[52svh] md:inset-x-12 lg:static">
          <span className="block lg:absolute lg:top-[16.5svh] lg:left-12">
            <RevealWords text={HERO.title} />
          </span>
          <span className="block lg:absolute lg:right-12 lg:bottom-[21svh] lg:text-right">
            <RevealWords text="" accent={HERO.accent} accentClass="k9-accent" first={2} />
          </span>
        </h1>
        <p data-reveal="up" className="k9-claim absolute top-[17.5svh] right-12 hidden lg:flex">
          {HERO.claim.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </p>
        <div className="absolute inset-x-6 bottom-8 md:inset-x-12 lg:right-auto lg:bottom-12 lg:max-w-[480px]">
          <p data-reveal="up" className="k9-lead">
            <span className="lg:hidden">{LEAD}</span>
            <span className="hidden lg:inline">{HERO.text}</span>
          </p>
          <div data-reveal="up" className="mt-6 flex flex-wrap gap-3 lg:mt-7">
            <Btn href={LINKS.analysis}>{HERO.primary}</Btn>
            <Btn href={LINKS.booking} glass>
              {HERO.secondary}
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Desktop: each problem labelled at its shard's place, appearing as the shard arrives. Phones: one at a time. */
function ShardLabel({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const slot = SHARD_SLOTS_DESK[index];
  const from = 0.1 + index * 0.06;
  const opacity = useTransform(progress, [from, from + 0.12], [0, 1]);
  const y = useTransform(progress, [from, from + 0.12], [12, 0]);
  const item = PROBLEM.items[index];
  return (
    <motion.div
      className="k9-tag absolute hidden -translate-x-1/2 lg:grid"
      style={{
        left: `${slot.fx * 100}%`,
        top: `calc(${slot.fy * 100}% + 92px)`,
        opacity,
        y,
      }}
    >
      <span className="k9-num">{String(index + 1).padStart(2, "0")}</span>
      <span className="k9-tag-title">{item.title}</span>
    </motion.div>
  );
}

function Problem() {
  const { ref, progress } = useStage();
  const step = useStep(progress, PROBLEM.items.length);
  const item = PROBLEM.items[step];
  return (
    <section ref={ref} data-k9="problem" className="relative h-[330vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative mx-auto h-full max-w-[1440px] px-6 md:px-12">
          <div className="absolute inset-x-6 top-[45svh] md:inset-x-12 lg:top-[17svh] lg:right-auto lg:max-w-[460px]">
            <h2 data-reveal="heading" className="k9-h2">
              <RevealWords text={PROBLEM.title} accent={PROBLEM.accent} accentClass="k9-accent" />
            </h2>
            <p data-reveal="up" className="k9-body mt-6 hidden max-w-[380px] lg:block">
              {PROBLEM.text}
            </p>
          </div>
          {PROBLEM.items.map((p, i) => (
            <ShardLabel key={p.title} index={i} progress={progress} />
          ))}
          {/* Phones: the problem whose shard is lit, one at a time. */}
          <div className="absolute inset-x-6 bottom-10 lg:hidden" aria-live="polite">
            <p className="k9-num">
              {String(step + 1).padStart(2, "0")} / {String(PROBLEM.items.length).padStart(2, "0")}
            </p>
            <p className="k9-h3 mt-2">{item.title}</p>
            <p className="k9-small mt-2">{item.text}</p>
          </div>
          <ol className="sr-only">
            {PROBLEM.items.map((p) => (
              <li key={p.title}>
                {p.title}: {p.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { ref, progress } = useStage();
  const step = useStep(progress, SERVICES.items.length);
  return (
    <section ref={ref} data-k9="services" id="leistungen" className="relative h-[420vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative mx-auto h-full max-w-[1440px] px-6 md:px-12">
          <h2 data-reveal="heading" className="k9-h2 absolute inset-x-6 top-[45svh] md:inset-x-12 lg:top-[17svh] lg:right-auto lg:max-w-[520px]">
            <RevealWords text={SERVICES.title} accent={SERVICES.accent} accentClass="k9-accent" />
          </h2>
          <div className="absolute inset-x-6 bottom-10 md:inset-x-12 lg:right-auto lg:bottom-[12svh] lg:w-[460px]">
            <ol className="flex gap-2" aria-label="Leistungen">
              {SERVICES.items.map((s, i) => (
                <li key={s.id} data-on={i === step} className="k9-step">
                  <span className="k9-num">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
            <div className="relative mt-6 min-h-[210px] lg:min-h-[230px]">
              {SERVICES.items.map((s, i) => (
                <article key={s.id} data-on={i === step} aria-hidden={i !== step} className="k9-svc">
                  <h3 className="k9-h3-lg">{s.title}</h3>
                  <p className="k9-small mt-3 lg:text-[15.5px]">{s.text}</p>
                  <a href={LINKS.contact} {...EXT} tabIndex={i === step ? 0 : -1} className="k9-link group mt-5">
                    {s.cta}
                    <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cases() {
  const { ref, progress } = useStage();
  const step = useStep(progress, CASES.items.length);
  const item = CASES.items[step];
  return (
    <section ref={ref} data-k9="cases" id="use-cases" className="relative h-[400vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative mx-auto h-full max-w-[1440px] px-6 md:px-12">
          <h2 data-reveal="heading" className="k9-h2 absolute inset-x-6 top-[45svh] md:inset-x-12 lg:top-[17svh] lg:right-auto lg:max-w-[440px]">
            <RevealWords text={CASES.title} accent={CASES.accent} accentClass="k9-accent" />
          </h2>
          <ol className="k9-cases absolute top-[46svh] left-12 hidden w-[300px] lg:block" aria-label="Praxisbeispiele">
            {CASES.items.map((c, i) => (
              <li key={c.name} data-on={i === step}>
                <span className="k9-num">{String(i + 1).padStart(2, "0")}</span>
                {c.name}
              </li>
            ))}
          </ol>
          <div className="absolute inset-x-6 bottom-10 md:inset-x-12 lg:right-auto lg:bottom-[9svh] lg:w-[380px]" aria-live="polite">
            <p className="k9-num lg:hidden">
              {String(step + 1).padStart(2, "0")} / {String(CASES.items.length).padStart(2, "0")}
            </p>
            <p className="k9-h3 mt-2 lg:mt-0">{item.tagline}</p>
            <p className="k9-small mt-2">{item.text}</p>
            <dl className="sr-only">
              {item.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.value}</dt>
                  <dd>{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section data-k9="cta" id="kontakt" className="relative">
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-6 pt-[50svh] pb-8 md:px-12 lg:pt-40">
        <div className="lg:max-w-[580px]">
          <h2 data-reveal="heading" className="k9-h2-xl">
            <RevealWords text={CTA.title} accent={CTA.accent} accentClass="k9-accent" />
          </h2>
          <p data-reveal="up" className="k9-lead mt-6 max-w-[460px]">
            {CTA.text}
          </p>
          <div data-reveal="up" className="mt-8 flex flex-wrap gap-3">
            <Btn href={LINKS.contact}>{CTA.primary}</Btn>
            <Btn href={LINKS.booking} glass>
              {CTA.secondary}
            </Btn>
          </div>
          <ul data-reveal="up" className="mt-7 grid gap-2">
            {CTA.checks.map((check) => (
              <li key={check} className="k9-small flex items-center gap-2">
                <Check aria-hidden strokeWidth={2.4} className="size-4 text-[#69bff8]" />
                {check}
              </li>
            ))}
          </ul>
        </div>
        <div className="k9-legal mt-16 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center lg:mt-24">
          <span>{FOOTER.copyright}</span>
          <nav aria-label="Rechtliches" className="flex gap-5">
            {FOOTER.legal.map((link) => (
              <a key={link.label} href={link.href} {...EXT}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

export function ObsidianConcept({ fontClass }: { fontClass: string }) {
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  return (
    <div className={cn(fontClass, "k9 relative isolate min-h-screen")}>
      {webgl && (
        <StageGuard>
          <Stage reduced={reduced} />
        </StageGuard>
      )}
      <Header />
      <main className="relative z-10">
        <div>
          <Hero />
          <Problem />
          <Services />
          <Cases />
          <Closing />
        </div>
      </main>
      <RevealObserver />
      <SmoothScroll />
    </div>
  );
}
