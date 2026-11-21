"use client";

import { Bot, MessageCircle, PhoneCall, Workflow, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import { Container, Heading, PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import type { ServiceId } from "@/content/pages/leistungen";
import { useCopy } from "@/i18n/client";
import { useOnScreen, useReducedMotion, useTabVisible } from "./shared";

/*
  Hero, "BG Engine": his headline centred over the engine. The bG mark sits in a glowing glass core; thin concentric
  orbit rings lie around it in gentle perspective (flat ellipses, fainter at the back), and his four services orbit
  it as small glass pills (icon, name, his sub-line), larger and brighter at the front, smaller and dimmer at the back.

  The orbit is pure CSS (leistungen.css, "Hero engine"): each pill rides two eased translate loops a quarter period
  apart (an ellipse) and a third loop for its depth, so it runs on the compositor and pauses while a pill is hovered
  or focused, or while the engine is off screen. Every few seconds a faint light leaves one satellite and runs into
  the core, which answers with a soft ripple; hovering a pill sends its light at once. Each pill links to its service
  section below.

  Below 1024px the same markup, still: the core is smaller and the four pills sit around it on the rings (two above,
  two below; on phones the names on his own two lines, without the sub-lines), and the lights still run in. The
  orbit needs the width of a laptop to keep every pill clear of the core. Reduced motion: no orbit and no lights,
  the pills at their resting places.
  Round 5 (DE/EN): copy by language.
*/

const ICONS: Record<ServiceId, LucideIcon> = {
  "ki-agenten": Bot,
  chatbots: MessageCircle,
  callbots: PhoneCall,
  marketing: Workflow,
};

/*
  Where each pill starts on the orbit, as a share of one turn (0 is the right end, a quarter is the front). The x loop
  starts at the pill's angle, the y and depth loops a quarter turn earlier (y = ry sin a). Clockwise from the top left.
*/
const DEGREES = [225, 315, 45, 135];
const START = DEGREES.map((deg) => ({ x: deg / 360, y: ((((deg - 90) % 360) + 360) % 360) / 360 }));

/** Between two lights, in ms. */
const EVERY = 3800;
const TRAVEL = 1150;

export function HeroSection() {
  const copy = useCopy();
  const { HERO } = copy.leistungen;
  const { LINKS } = copy.site;
  return (
    <section id="hero" className="relative pt-[96px] pb-14 sm:pt-[124px] md:pt-[132px] md:pb-20">
      <Container>
        <div className="mx-auto max-w-[1140px] text-center">
          <Heading
            as="h1"
            size="display"
            title={HERO.title}
            accent={HERO.accent}
            className="ls-hero-title mx-auto"
          />
          <p data-reveal="up" data-rd="2" className="ls-hero-lead mx-auto mt-4 max-w-[700px] sm:mt-6 lg:max-w-[880px]">
            {HERO.text}
          </p>
          <div data-reveal="up" data-rd="3" className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
            <PrimaryLink href={LINKS.analysis} className="h-[46px] sm:h-12">
              {HERO.primary}
            </PrimaryLink>
            <SecondaryLink href={LINKS.booking} className="h-[46px] sm:h-12">
              {HERO.secondary}
            </SecondaryLink>
          </div>
        </div>
        <Engine />
      </Container>
    </section>
  );
}

function Engine() {
  const { HERO, SERVICES } = useCopy().leistungen;
  const count = SERVICES.length;
  const stage = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLSpanElement>(null);
  const spoke = useRef<HTMLSpanElement>(null);
  const ripple = useRef<HTMLSpanElement>(null);
  const lastFire = useRef(0);
  const next = useRef(0);

  const onScreen = useOnScreen(stage, "80px");
  const visible = useTabVisible();
  const reduced = useReducedMotion();
  const live = onScreen && visible && !reduced;

  /** One light from satellite `k` into the core. Measured at the moment it leaves, so it starts where the pill is. */
  const fire = useCallback((k: number) => {
    const box = stage.current;
    const pill = box?.querySelectorAll<HTMLElement>("[data-pill]")[k];
    const core = box?.querySelector<HTMLElement>("[data-core]");
    if (!box || !pill || !core || !beam.current || !spoke.current || !ripple.current) return;
    const now = performance.now();
    if (now - lastFire.current < 700) return;
    lastFire.current = now;

    const s = box.getBoundingClientRect();
    const p = pill.getBoundingClientRect();
    const c = core.getBoundingClientRect();
    const from = { x: p.left + p.width / 2 - s.left, y: p.top + p.height / 2 - s.top };
    const to = { x: c.left + c.width / 2 - s.left, y: c.top + c.height / 2 - s.top };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.hypot(dx, dy);
    const at = (share: number) => `translate(${from.x + dx * share}px, ${from.y + dy * share}px) rotate(${angle}rad)`;

    // The faint line between the two, there only while the light travels.
    spoke.current.style.width = `${length}px`;
    spoke.current.animate(
      [
        { transform: `${at(0)} scaleX(0)`, opacity: 0 },
        { transform: `${at(0)} scaleX(1)`, opacity: 1, offset: 0.35 },
        { transform: `${at(0)} scaleX(1)`, opacity: 1, offset: 0.8 },
        { transform: `${at(0)} scaleX(1)`, opacity: 0 },
      ],
      { duration: TRAVEL + 500, easing: "ease-out" }
    );
    beam.current.animate(
      [
        { transform: `${at(0.12)} scaleX(0.3)`, opacity: 0 },
        { transform: `${at(0.3)} scaleX(1)`, opacity: 1, offset: 0.25 },
        { transform: `${at(1)} scaleX(1)`, opacity: 1, offset: 0.9 },
        { transform: `${at(1)} scaleX(0.4)`, opacity: 0 },
      ],
      { duration: TRAVEL, easing: "cubic-bezier(0.55, 0, 0.75, 1)" }
    );
    ripple.current.animate(
      [
        { transform: "scale(1)", opacity: 0 },
        { transform: "scale(1)", opacity: 0.85, offset: 0.08 },
        { transform: "scale(1.5)", opacity: 0 },
      ],
      { duration: 1000, delay: TRAVEL - 120, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    );
    pill
      .querySelector<HTMLElement>("[data-lit]")
      ?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }], { duration: TRAVEL + 400, easing: "ease-out" });
  }, []);

  // The idle lights: one satellite after another, only while the engine is on screen in a visible tab.
  useEffect(() => {
    if (!live) return undefined;
    const tick = () => {
      fire(next.current % count);
      next.current += 1;
    };
    const first = window.setTimeout(tick, 1400);
    const timer = window.setInterval(tick, EVERY);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [live, fire, count]);

  const onPointerEnter = (k: number) => (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "mouse" && live) fire(k);
  };
  const onFocus = (k: number) => (event: FocusEvent<HTMLAnchorElement>) => {
    if (live && event.target.matches(":focus-visible")) fire(k);
  };

  return (
    <div ref={stage} role="group" aria-label={HERO.engine} data-off={live ? undefined : ""} className="ls-engine">
      <div aria-hidden className="ls-rings">
        <span className="ls-ring ls-ring-plane" />
        <span className="ls-ring ls-ring-1" />
        <span className="ls-ring ls-ring-2" />
        <span className="ls-ring ls-ring-3" />
      </div>
      <span aria-hidden className="ls-core-glow" />
      <span ref={spoke} aria-hidden className="ls-spoke" />
      <span ref={beam} aria-hidden className="ls-beam" />

      <div data-core className="ls-core">
        <span ref={ripple} aria-hidden className="ls-core-ripple" />
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static vector mark; next/image adds nothing */}
        <img src="/brand/mark.svg" alt="" width={721} height={454} draggable={false} className="ls-core-mark" />
      </div>

      <ul role="list" className="ls-orbits">
        {SERVICES.map((service, k) => {
          const Icon = ICONS[service.id];
          const style = { "--px": START[k].x, "--py": START[k].y, "--a": `${DEGREES[k]}deg` } as CSSProperties;
          return (
            <li key={service.id} className="ls-orbit" style={style}>
              <div className="ls-orbit-y">
                <div className="ls-orbit-d">
                  <a
                    href={`#${service.id}`}
                    data-pill
                    className="ls-pill"
                    onPointerEnter={onPointerEnter(k)}
                    onFocus={onFocus(k)}
                  >
                    <span data-lit aria-hidden className="ls-pill-lit" />
                    <Icon aria-hidden strokeWidth={1.6} className="ls-pill-icon" />
                    <span className="ls-pill-text">
                      <span className="ls-pill-name">
                        {service.lines.map((line, i) => (
                          <span key={line} className="ls-pill-line">
                            {i > 0 ? " " : null}
                            {line}
                          </span>
                        ))}
                      </span>
                      <span className="ls-pill-sub">{service.sub}</span>
                    </span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
