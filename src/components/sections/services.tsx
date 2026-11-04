"use client";

import { MessagesSquare, PhoneCall, TrendingUp, Workflow, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { isSceneId, SCENE_ASPECT, SCENES, ServiceAnimation, usePrefersReducedMotion, type SceneId } from "@/components/sections/service-scenes";
import { Container, Heading, IconChip, Section, TextLink } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { LINKS, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Leistungen: a tabbed showcase after the interactive "Objektreport" on arventas.de. One panel shows the active
  service, its looping line drawing beside the details, where the step the drawing is acting out is highlighted.
  Under the panel sits one tab per service. The active tab's top edge fills while its drawing plays, and the panel
  moves on when the drawing completes its loop, so no drawing is ever cut off. It moves on only while the drawing
  is on screen, nobody has clicked a tab in the last 20 seconds, keyboard focus is outside the showcase, and the
  visitor has not asked for reduced motion.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const HOLD_MS = 20_000;
const PANEL_ID = "leistungen-panel";
const tabId = (id: SceneId) => `leistungen-tab-${id}`;
// The list heading from v1's service cards; site.ts has no line for it.
const INCLUDES = "Was dazugehört";

const ICONS: Record<SceneId, LucideIcon> = { agents: Workflow, chat: MessagesSquare, calls: PhoneCall, marketing: TrendingUp };

type Service = (typeof SERVICES.items)[number] & { id: SceneId };
const ITEMS = SERVICES.items.filter((s): s is Service => isSceneId(s.id));

/** The panel content for one service. Drawn live for the active service, and invisibly for each service to hold the tallest one's height. */
function ServiceBody({ service, index, step, drawing, live = false }: { service: Service; index: number; step: number; drawing: ReactNode; live?: boolean }) {
  const listId = live ? `leistungen-steps-${service.id}` : undefined;
  return (
    <div className="grid h-full content-start gap-8 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:content-stretch lg:gap-14">
      <div className="-mx-6 md:mx-0 lg:self-center">{drawing}</div>
      <div className="lg:self-start">
        <h3 className="text-[24px] leading-[1.15] font-medium tracking-tight text-balance text-white hyphens-auto sm:text-[30px]">
          <span aria-hidden className="num mr-3 text-[40px] leading-none text-sky">
            {String(index + 1).padStart(2, "0")}
          </span>
          {service.title}
        </h3>
        <p className="t-body mt-5">{service.text}</p>
        <h4 id={listId} className="mt-8 text-[14px] font-normal text-white/60">
          {INCLUDES}
        </h4>
        <ol aria-labelledby={listId} className="mt-4 grid gap-y-3 xl:auto-cols-fr xl:grid-flow-col xl:grid-rows-3 xl:gap-x-6">
          {SCENES[service.id].steps.map(([, , name], i) => {
            const on = i === step;
            return (
              <li
                key={name}
                aria-current={on ? "step" : undefined}
                className={cn("flex items-center gap-3 text-[16px] leading-snug transition-colors duration-300", on ? "text-white" : step < 0 ? "text-ink/80" : "text-ink/45")}
              >
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full transition-colors duration-300", on ? "bg-sky" : step < 0 ? "bg-sky/60" : "bg-white/20")} />
                {name}
              </li>
            );
          })}
        </ol>
        <div className="mt-8">
          <TextLink href={LINKS.analysis}>{service.cta}</TextLink>
        </div>
      </div>
    </div>
  );
}

function LiveService({ service, index, onLoopEnd, progress }: { service: Service; index: number; onLoopEnd: () => boolean; progress: MotionValue<number> }) {
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  return (
    <ServiceBody
      live
      service={service}
      index={index}
      // Reduced motion shows the still frame, so no step is "current" and the whole list reads at one level.
      step={reduced ? -1 : step}
      drawing={<ServiceAnimation id={service.id} onStep={setStep} onLoopEnd={onLoopEnd} progress={progress} className="[contain:layout_paint]" />}
    />
  );
}

function ServiceShowcase() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [holdKey, setHoldKey] = useState(0);
  const [keyboard, setKeyboard] = useState(false);
  const reduced = usePrefersReducedMotion();
  const progress = useMotionValue(0);
  const row = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const auto = !held && !keyboard && !reduced;
  const service = ITEMS[active];

  // A click on a tab holds the auto-advance for 20 seconds; each click starts the wait again.
  useEffect(() => {
    if (!holdKey) return;
    const timer = window.setTimeout(() => setHeld(false), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [holdKey]);

  // Each service starts with an empty bar. On phones the tab row brings the active tab into view, sideways only.
  useEffect(() => {
    progress.set(0);
    const list = row.current;
    const tab = tabs.current[active];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
    list.scrollTo({ left: tab.offsetLeft - pad, behavior: reduced ? "auto" : "smooth" });
  }, [active, progress, reduced]);

  const select = (i: number) => {
    progress.set(0);
    setActive(i);
    setHeld(true);
    setHoldKey((k) => k + 1);
  };

  // Called by the drawing when it completes a loop: move on, or let it loop again while the visitor is in control.
  const onLoopEnd = () => {
    if (!auto) return false;
    progress.set(0);
    setActive((i) => (i + 1) % ITEMS.length);
    return true;
  };

  // Arrow keys, Home and End move between tabs and select at once (the WAI-ARIA tabs pattern, automatic activation).
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const last = ITEMS.length - 1;
    const keys: Partial<Record<string, number>> = { ArrowRight: from === last ? 0 : from + 1, ArrowLeft: from === 0 ? last : from - 1, Home: 0, End: last };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  // Keyboard focus anywhere in the showcase holds the auto-advance, so the selection never moves under a keyboard
  // user. A mouse click focuses without :focus-visible and only starts the 20 second hold.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    setKeyboard(e.target.matches(":focus-visible"));
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setKeyboard(false);
  };

  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(service.id)} className="surface rounded-[32px] p-6 md:p-10">
        <div className="grid">
          {/* Invisible copies of every service hold the tallest one's height, so the panel and the tabs never jump. */}
          {ITEMS.map((s, i) => (
            <div key={s.id} aria-hidden inert className="invisible col-start-1 row-start-1">
              <ServiceBody service={s} index={i} step={-1} drawing={<div style={{ aspectRatio: SCENE_ASPECT }} />} />
            </div>
          ))}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={service.id}
              className="col-start-1 row-start-1"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
            >
              <LiveService service={service} index={active} onLoopEnd={onLoopEnd} progress={progress} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div
        ref={row}
        role="tablist"
        aria-label={SERVICES.title}
        className="relative -mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pt-2 pb-3 [scrollbar-width:none] md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:mt-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden"
      >
        {ITEMS.map((s, i) => {
          const on = i === active;
          const Icon = ICONS[s.id];
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(s.id)}
              aria-selected={on}
              aria-controls={PANEL_ID}
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group relative flex w-[64vw] max-w-[280px] shrink-0 cursor-pointer snap-start items-center gap-3.5 rounded-xl pt-6 text-left lg:w-auto lg:max-w-none lg:min-w-0"
            >
              {/* The bar fills while the drawing plays; it stays full while the visitor is in control. */}
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] overflow-hidden rounded-full bg-white/10">
                <motion.span className="absolute inset-0 origin-left rounded-full bg-sky" style={{ scaleX: on ? (auto ? progress : 1) : 0 }} />
              </span>
              <IconChip className={cn("transition-opacity duration-300", on ? "opacity-100" : "opacity-55 group-hover:opacity-90")}>
                <Icon strokeWidth={1.5} aria-hidden />
              </IconChip>
              <span className={cn("min-w-0 text-[15px] leading-snug font-medium hyphens-auto transition-colors duration-300", on ? "text-white" : "text-ink/55 group-hover:text-ink/85")}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <Section id="leistungen">
      <Container>
        <Reveal>
          <Heading title={SERVICES.title} accent={SERVICES.accent} className="max-w-[820px]" />
          <p className="t-lead mt-6 max-w-[620px]">{SERVICES.text}</p>
        </Reveal>
        <Reveal className="mt-14 md:mt-20" delay={0.1}>
          <ServiceShowcase />
        </Reveal>
      </Container>
    </Section>
  );
}
