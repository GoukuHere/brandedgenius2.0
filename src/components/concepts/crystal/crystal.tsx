"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, FOOTER, HEADER, HERO, LINKS, MEDIA, NAV, PROBLEM, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { RevealWords, useReducedMotion } from "../shared";
import { StageGuard, useWebGL } from "./webgl";

/*
  Version v8, "Kristall" (2026-11-07). The developer asked for two more versions, one white and one dark, "super
  futuristic and stunning", with glass and 3D, "totally new from all the previous ones". Research (Awwwards 2025-26)
  showed real refractive glass is rare even among award winners, and that the strongest sites carry one specific
  object through the whole page instead of decorating it.

  This one is white. The object is the client's own bG monogram, cut from crystal glass with its chrome eye (built
  in WebGL from the real mark, see scene.tsx). It travels with the reading: its eye follows the mouse, the founder's
  film opens out of that eye, the glass clouds over while the six problems are read and clears for the services,
  and the eye watches the results. Everything else stays quiet: cool white, blue-black type in Mona Sans (set wide
  for headlines), royal for actions, and the brand's blue gradient living inside the glass.
*/

const Stage = dynamic(() => import("./scene").then((m) => m.CrystalStage), {
  ssr: false,
});

const EXT = { target: "_blank", rel: "noopener" } as const;
/** The hero's lead cut to its first clause for phones, where the crystal and the buttons must share one screen. */
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
    <a href={href} {...EXT} className={cn("k8-btn group", glass ? "k8-btn-glass" : "k8-btn-royal", small && "k8-btn-sm", className)}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function Header() {
  const contact = NAV.find((item) => item.href === "#kontakt")?.label ?? "Kontakt";
  return (
    <>
      <div aria-hidden className="k8-headband" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:h-[88px] md:px-12">
          <a href="#top" aria-label="Branded Genius, zum Anfang" className="k8-logo pointer-events-auto block h-[24px] md:h-[28px]">
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

function Hero() {
  return (
    <section data-k8="hero" id="top" className="relative">
      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-6 pt-[50svh] pb-10 md:px-12 md:pt-36 md:pb-20">
        <h1 data-reveal="heading" className="k8-h1 max-w-[670px]">
          <RevealWords text={HERO.title} accent={HERO.accent} accentClass="k8-accent" />
        </h1>
        <p data-reveal="up" className="k8-lead mt-5 max-w-[520px] md:mt-6">
          <span className="md:hidden">{LEAD}</span>
          <span className="hidden md:inline">{HERO.text}</span>
        </p>
        <div data-reveal="up" className="mt-9 flex flex-wrap gap-3">
          <Btn href={LINKS.analysis}>{HERO.primary}</Btn>
          <Btn href={LINKS.booking} glass>
            {HERO.secondary}
          </Btn>
        </div>
      </div>
      {/* The sculpture's caption, as in a gallery: the client's three-word claim under the crystal. */}
      <p data-reveal="up" className="k8-caption absolute top-[calc(38.5%+258px)] left-[72%] hidden -translate-x-1/2 lg:flex">
        {HERO.claim.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </p>
    </section>
  );
}

/** The founder's film. The crystal's stage clips it to a circle that opens out of the monogram's eye. */
function Film() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section data-k8="film" aria-label="Film: Roman Tränkle mit zwei KI-Robotern" className="relative h-[250vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center px-4 md:px-12">
        <div data-k8-film className="k8-film relative aspect-[4/5] w-full max-w-[1280px] overflow-hidden rounded-[20px] md:aspect-video md:rounded-[24px]">
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            src={MEDIA.heroVideo}
            poster={MEDIA.heroPoster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Roman Tränkle, Gründer von Branded Genius, mit zwei KI-Robotern"
          />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section data-k8="problem" className="relative">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-x-16 px-6 pt-28 pb-24 md:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-44 lg:pb-48">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 data-reveal="heading" className="k8-h2 max-w-[520px]">
            <RevealWords text={PROBLEM.title} accent={PROBLEM.accent} accentClass="k8-accent" />
          </h2>
          <p data-reveal="up" className="k8-body mt-6 max-w-[440px]">
            {PROBLEM.text}
          </p>
        </div>
        <ol data-reveal-group className="mt-14 lg:mt-0">
          {PROBLEM.items.map((item, i) => (
            <li
              key={item.title}
              data-k8-problem
              className="k8-problem grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 py-7 lg:grid-cols-[64px_minmax(0,1fr)] lg:py-9"
            >
              <span className="k8-num">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="k8-h3 block">{item.title}</span>
                <span className="k8-small mt-2 block max-w-[440px]">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.floor(v * 3.999))));
  return (
    <section data-k8="services" id="leistungen" className="relative">
      <div className="mx-auto max-w-[1440px] px-6 pt-24 md:px-12 lg:pt-36">
        <h2 data-reveal="heading" className="k8-h2 max-w-[620px]">
          <RevealWords text={SERVICES.title} accent={SERVICES.accent} accentClass="k8-accent" />
        </h2>
        <p data-reveal="up" className="k8-body mt-6 max-w-[480px]">
          {SERVICES.text}
        </p>
      </div>
      {/* Four steps on one held screen; the crystal turns to a new angle and changes its light for each. */}
      <div ref={ref} data-k8-steps className="relative h-[400vh]">
        <div className="sticky top-0 h-[100svh]">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-12 md:px-12 lg:justify-center lg:pb-0">
            <div className="grid max-w-[600px] gap-8 lg:gap-10">
              <ol className="k8-index grid grid-cols-4 gap-2 lg:gap-3" aria-label="Leistungen">
                {SERVICES.items.map((item, i) => (
                  <li key={item.id} data-on={i === step} className="k8-index-item">
                    <span className="k8-num">{String(i + 1).padStart(2, "0")}</span>
                  </li>
                ))}
              </ol>
              <div className="relative min-h-[300px] lg:min-h-[280px]">
                {SERVICES.items.map((item, i) => (
                  <article key={item.id} data-on={i === step} aria-hidden={i !== step} className="k8-svc">
                    <h3 className="k8-h2-sm">{item.title}</h3>
                    <p className="k8-body mt-4 max-w-[500px]">{item.text}</p>
                    <a href={LINKS.contact} {...EXT} tabIndex={i === step ? 0 : -1} className="k8-link group mt-6">
                      {item.cta}
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cases() {
  const list = useRef<HTMLOListElement>(null);
  // The result row nearest the middle of the screen is the one being read: its figures take the brand's blue.
  useEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const rows = [...el.querySelectorAll<HTMLElement>("[data-k8-row]")];
      let best = -1;
      let dist = Infinity;
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < dist && r.bottom > 0 && r.top < window.innerHeight) {
          dist = d;
          best = i;
        }
      });
      rows.forEach((row, i) => (row.dataset.on = i === best ? "1" : "0"));
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);
  return (
    <section data-k8="cases" id="use-cases" className="relative">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-x-16 px-6 pt-28 pb-24 md:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-44 lg:pb-44">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 data-reveal="heading" className="k8-h2 max-w-[520px]">
            <RevealWords text={CASES.title} accent={CASES.accent} accentClass="k8-accent" />
          </h2>
          <p data-reveal="up" className="k8-body mt-6 max-w-[420px]">
            {CASES.text}
          </p>
        </div>
        <ol ref={list} className="mt-14 lg:mt-0">
          {CASES.items.map((item) => (
            <li key={item.name} data-k8-row data-on="0" className="k8-row py-8 lg:py-10">
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="k8-h3">{item.name}</span>
                <span className="k8-small">{item.tagline}</span>
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 lg:gap-x-8">
                {item.metrics.map((m) => (
                  <div key={m.label}>
                    <dt className="k8-figure">{m.value}</dt>
                    <dd className="k8-small mt-1.5">{m.label}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section data-k8="cta" id="kontakt" className="relative">
      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-6 pt-[52svh] pb-8 md:px-12 lg:pt-40">
        <h2 data-reveal="heading" className="k8-h2 max-w-[620px]">
          <RevealWords text={CTA.title} accent={CTA.accent} accentClass="k8-accent" />
        </h2>
        <p data-reveal="up" className="k8-lead mt-6 max-w-[520px]">
          {CTA.text}
        </p>
        <div data-reveal="up" className="mt-9 flex flex-wrap gap-3">
          <Btn href={LINKS.contact}>{CTA.primary}</Btn>
          <Btn href={LINKS.booking} glass>
            {CTA.secondary}
          </Btn>
        </div>
        <ul data-reveal="up" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {CTA.checks.map((check) => (
            <li key={check} className="k8-small flex items-center gap-2">
              <Check aria-hidden strokeWidth={2.4} className="size-4 text-[#004ba0]" />
              {check}
            </li>
          ))}
        </ul>
        <div className="k8-legal mt-20 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center lg:mt-28">
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

export function CrystalConcept({ fontClass }: { fontClass: string }) {
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  return (
    <div className={cn(fontClass, "k8 relative isolate min-h-screen")}>
      {webgl && (
        <StageGuard>
          <Stage reduced={reduced} />
        </StageGuard>
      )}
      <Header />
      <main className="relative z-10">
        <div>
          <Hero />
          <Film />
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
