"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ServiceAnimation, isSceneId } from "@/components/sections/service-scenes";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, FOOTER, HEADER, HERO, LINKS, PROBLEM, PROMISE, REALITY, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { Grain, HeroFilm, RevealWords } from "../shared";

/*
  Concept 3, "Papier" (2026-11-07). The developer asked for two more concepts with totally new colours and
  everything, because the first two still felt like the earlier dark versions. This one turns the page light:
  warm paper, ink type, the brand's royal as a solid accent and one deep royal band, set like a magazine.
  - Type: Newsreader (an upright editorial serif) for headlines and large text, General Sans for reading and UI.
  - Layout: a magazine cover (headline, then the film as a wide plate), then sticky splits where the headline
    column stays while the content scrolls beside it, one royal statement band with the four promises, an index of
    the services with a drawing that follows the cursor, a ledger of the case results.
  - Buttons: solid ink that turns royal on hover, and underlined text links.
*/

const EXT = { target: "_blank", rel: "noopener" } as const;
const LEAD = `${HERO.text.split(" für ")[0]}.`;

function InkButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} {...EXT} className={cn("c3-btn group", className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} {...EXT} className={cn("c3-link group", className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--c3-line)] bg-[rgb(243_239_230/0.86)] backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between px-6 lg:h-[76px] lg:px-12">
        <a href="#top" aria-label="Branded Genius, zum Anfang" className="c3-logo block h-[24px] lg:h-[28px]">
          <BrandLogo />
        </a>
        <InkButton href={LINKS.contact} className="c3-btn-sm">
          <span className="hidden sm:inline">{HEADER.cta}</span>
          <span className="sm:hidden">Kontakt</span>
        </InkButton>
      </div>
    </header>
  );
}

function Cover() {
  return (
    <section id="top" className="relative pt-[112px] pb-16 lg:pt-[150px] lg:pb-24">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-8 px-6 lg:grid-cols-12 lg:items-end lg:gap-10 lg:px-12">
        <h1 data-reveal="heading" className="c3-serif c3-display lg:col-span-8">
          <RevealWords text={HERO.title} accent={HERO.accent} accentClass="text-[var(--c3-royal)]" />
        </h1>
        <div className="lg:col-span-4 lg:pb-2">
          <p data-reveal="up" data-rd="2" className="c3-lede max-w-[420px]">
            {LEAD}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <InkButton href={LINKS.analysis}>{HERO.primary}</InkButton>
            <TextLink href={LINKS.booking}>{HERO.secondary}</TextLink>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1360px] px-6 lg:mt-16 lg:px-12">
        <div data-reveal="photo" className="c3-plate relative aspect-[4/3] overflow-hidden rounded-[22px] sm:aspect-[2/1]">
          <HeroFilm className="absolute inset-0 [&_img]:object-[50%_30%] [&_video]:object-[50%_30%]" sizes="(min-width: 1360px) 1264px, 100vw" />
        </div>
        <p data-reveal="up" className="c3-serif mt-8 flex flex-wrap gap-x-10 gap-y-2 text-[26px] leading-none tracking-[-0.015em] lg:mt-10 lg:text-[34px]">
          {HERO.claim.map((w, i) => (
            <span key={w} className={i === 1 ? "text-[var(--c3-royal)]" : undefined}>
              {w}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/** A thin rule beside the sticky column that fills while the content next to it is read. */
function ReadingRule({ target }: { target: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start 70%", "end 60%"] });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 120, damping: 30 });
  return (
    <div aria-hidden className="mt-10 hidden h-px w-full max-w-[420px] overflow-hidden bg-[var(--c3-line)] lg:block">
      <motion.div className="h-full origin-left bg-[var(--c3-royal)]" style={{ scaleX: scale }} />
    </div>
  );
}

function Problem() {
  const list = useRef<HTMLOListElement>(null);
  return (
    <section id="problem" className="border-t border-[var(--c3-line)] py-20 lg:py-32">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-10 lg:px-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[132px]">
            <h2 data-reveal="heading" className="c3-serif c3-h2">
              <RevealWords text={PROBLEM.title} accent={PROBLEM.accent} accentClass="text-[var(--c3-royal)]" />
            </h2>
            <p data-reveal="up" data-rd="2" className="c3-body mt-6 max-w-[440px]">
              {PROBLEM.text}
            </p>
            <ReadingRule target={list} />
          </div>
        </div>
        <ol ref={list} className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:gap-y-16">
          {REALITY.items.map((r, i) => (
            <li key={r.title} className={cn(i % 2 === 1 && "sm:mt-20")}>
              <div data-reveal="photo" className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
                <Image src={r.img} alt={r.title} fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 100vw" className="object-cover" />
              </div>
              <p data-reveal="up" className="mt-5 flex items-baseline gap-3">
                <span className="c3-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="c3-serif text-[24px] leading-[1.18] tracking-[-0.012em]">{r.title}</span>
              </p>
              <p data-reveal="up" data-rd="1" className="c3-body mt-2 pl-8">
                {r.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Promise() {
  return (
    <section className="c3-band relative overflow-hidden py-20 text-[var(--c3-paper)] lg:py-28">
      <Grain />
      <div className="relative z-10 mx-auto max-w-[1360px] px-6 lg:px-12">
        <p data-reveal="heading" className="c3-serif max-w-[1080px] text-[clamp(2rem,1.4rem+1.9vw,3.5rem)] leading-[1.08] tracking-[-0.02em] [text-wrap:balance]">
          <RevealWords text={PROMISE.title} accent={PROMISE.accent} accentClass="text-[#9fd5fb]" />
        </p>
        <dl data-reveal-group className="mt-14 grid grid-cols-1 gap-x-8 gap-y-9 border-t border-white/20 pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {PROMISE.figures.map((f) => (
            <div key={f.label}>
              <dt className="c3-serif text-[36px] leading-none tracking-[-0.02em] lg:text-[46px] lg:whitespace-nowrap">{f.value}</dt>
              <dd className="mt-3 max-w-[220px] text-[15px] leading-[1.5] text-white/72">{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The services as an index. On a desktop mouse, the hovered service's drawing follows the pointer. */
function Services() {
  const [hover, setHover] = useState<number | null>(null);
  const [mouse, setMouse] = useState(false);
  const x = useSpring(0, { stiffness: 260, damping: 28 });
  const y = useSpring(0, { stiffness: 260, damping: 28 });
  useEffect(() => {
    setMouse(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);
  const active = hover === null ? null : SERVICES.items[hover];
  const scene = active && isSceneId(active.id) ? active.id : null;
  return (
    <section id="leistungen" className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 data-reveal="heading" className="c3-serif c3-h2 lg:col-span-7">
            <RevealWords text={SERVICES.title} accent={SERVICES.accent} accentClass="text-[var(--c3-royal)]" />
          </h2>
          <p data-reveal="up" data-rd="2" className="c3-body lg:col-span-4 lg:col-start-9">
            {SERVICES.text}
          </p>
        </div>
        <ul
          className="mt-12 border-t border-[var(--c3-ink)] lg:mt-16"
          onPointerMove={(e) => {
            x.set(e.clientX);
            y.set(e.clientY);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {SERVICES.items.map((item, i) => (
            <li key={item.id} className="border-b border-[var(--c3-line)]">
              <a
                href={LINKS.contact}
                {...EXT}
                onPointerEnter={() => setHover(i)}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-5 gap-y-3 py-8 lg:grid-cols-[60px_minmax(0,6fr)_minmax(0,4fr)_40px] lg:gap-x-8 lg:py-10"
              >
                <span className="c3-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="c3-serif text-[28px] leading-[1.1] tracking-[-0.018em] transition-[color,translate] duration-500 group-hover:translate-x-2 group-hover:text-[var(--c3-royal)] lg:text-[42px]">
                  {item.title}
                </span>
                <ArrowUpRight className="size-6 self-center justify-self-end text-[var(--c3-ink)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 lg:order-last" />
                <span className="c3-body col-span-3 lg:col-span-1">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* The hovered service's drawing follows the pointer (desktop mouse only). */}
      {mouse && (
        <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-40" style={{ x, y }}>
          <AnimatePresence>
            {scene && (
              <motion.div
                key={scene}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-[380px] translate-x-6 translate-y-6 overflow-hidden rounded-[16px] bg-[#191919] shadow-[0_30px_60px_-20px_rgb(15_26_43/0.55)]"
              >
                <ServiceAnimation id={scene} playing />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

function Cases() {
  const [active, setActive] = useState(0);
  const study = CASES.items[active];
  return (
    <section id="fallstudien" className="bg-[var(--c3-paper-2)] py-20 lg:py-32">
      <div className="mx-auto max-w-[1360px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 data-reveal="heading" className="c3-serif c3-h2 lg:col-span-7">
            <RevealWords text={CASES.title} accent={CASES.accent} accentClass="text-[var(--c3-royal)]" />
          </h2>
          <p data-reveal="up" data-rd="2" className="c3-body lg:col-span-4 lg:col-start-9">
            {CASES.text}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-[var(--c3-ink)] pt-8 lg:mt-16 lg:grid-cols-12 lg:gap-10 lg:pt-10">
          <div role="tablist" aria-label="Fallstudien" className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-3 lg:flex-col lg:gap-0">
            {CASES.items.map((c, i) => (
              <button
                key={c.area}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "relative cursor-pointer py-1 text-left transition-colors lg:border-b lg:border-[var(--c3-line)] lg:py-4",
                  i === active ? "text-[var(--c3-royal)]" : "text-[var(--c3-ink-soft)] hover:text-[var(--c3-ink)]"
                )}
              >
                <span className="c3-serif block text-[20px] leading-tight lg:text-[24px]">{c.area}</span>
                <span className="hidden text-[13px] lg:block">{c.kind}</span>
                {i === active && <motion.span layoutId="c3-case" className="absolute top-0 -left-4 hidden h-full w-[2px] bg-[var(--c3-royal)] lg:block" />}
              </button>
            ))}
          </div>
          <div className="min-h-[420px] lg:col-span-9 lg:col-start-4 lg:pl-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <p className="c3-serif max-w-[720px] text-[28px] leading-[1.15] tracking-[-0.015em] lg:text-[38px]">{study.tagline}</p>
                <dl className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:mt-14">
                  {study.metrics.map((m) => (
                    <div key={m.label} className="border-t border-[var(--c3-line)] pt-5">
                      <dt className="c3-serif text-[56px] leading-none tracking-[-0.03em] text-[var(--c3-royal)] lg:text-[76px]">{m.value}</dt>
                      <dd className="mt-3 max-w-[230px] text-[15px] leading-[1.5] text-[var(--c3-ink-soft)]">{m.label}</dd>
                    </div>
                  ))}
                </dl>
                <figure className="mt-12 max-w-[640px] lg:mt-16">
                  <blockquote className="c3-serif text-[22px] leading-[1.4] tracking-[-0.01em] lg:text-[26px]">„{study.quote}“</blockquote>
                  <figcaption className="mt-4 text-[14px] text-[var(--c3-ink-soft)]">{study.role}</figcaption>
                </figure>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section id="kontakt" className="pt-24 pb-10 lg:pt-36">
      <div className="mx-auto max-w-[1360px] px-6 lg:px-12">
        <h2 data-reveal="heading" className="c3-serif c3-display max-w-[980px]">
          <RevealWords text={CTA.title} accent={CTA.accent} accentClass="text-[var(--c3-royal)]" />
        </h2>
        <div data-reveal="up" data-rd="3" className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <InkButton href={LINKS.contact}>{CTA.primary}</InkButton>
          <TextLink href={LINKS.booking}>{CTA.secondary}</TextLink>
        </div>
        <ul data-reveal-group className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-[15px] text-[var(--c3-ink-soft)]">
          {CTA.checks.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-[var(--c3-royal)]" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-[var(--c3-line)] pt-6 text-[13px] text-[var(--c3-ink-soft)] sm:flex-row sm:items-center lg:mt-32">
          <span>{FOOTER.copyright}</span>
          <nav aria-label="Rechtliches" className="flex gap-5">
            {FOOTER.legal.map((link) => (
              <a key={link.label} href={link.href} {...EXT} className="transition-colors hover:text-[var(--c3-ink)]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

export function PaperConcept({ fontClass }: { fontClass: string }) {
  return (
    <div className={cn("c3", fontClass)}>
      <Header />
      <main>
        <div>
          <Cover />
          <Problem />
          <Promise />
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
