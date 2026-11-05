"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Container, Heading, Section } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { CASES, type CaseStudy } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Fallstudien (v3): the client's six case studies behind their own six two-line tabs. One sky-tinted glass pill
  glides behind the chosen tab; the case itself is set as type inside ONE blurred glass panel (no boxes inside it):
  the tagline as the headline, the three figures as a row divided by hairlines, the quote on a sky rule, and two
  quiet columns for what was built and which tools were used.

  All six cases sit stacked in one grid cell, so the panel always has the height of the longest case and nothing
  below it moves when the case changes. Only the chosen case is visible and reachable (the others are transparent,
  aria-hidden and inert). A switch slides 24px in the direction of travel along the tab bar: a tab to the right of
  the old one comes in from the right, a tab to the left comes in from the left.

  The panel carries the backdrop blur, so it must never sit inside Reveal or any other opacity, filter or mask
  wrapper; it runs its own one-off entrance instead. The case name and the arrows form the panel's title bar above
  a hairline (panel chrome, not a label over the headline).
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE = 24;
const ITEMS = CASES.items;
const COUNT = ITEMS.length;
const HEADING_ID = "use-cases-heading";
const tabId = (i: number) => `use-cases-tab-${i}`;
const panelId = (i: number) => `use-cases-panel-${i}`;

/** Where case `i` rests while case `index` is on show: in place, or just off to the side it lies on along the tab bar. */
function slideTo(i: number, index: number) {
  return i === index
    ? { opacity: 1, x: 0, transition: { x: { duration: 0.4, ease: EASE }, opacity: { duration: 0.4, delay: 0.05, ease: EASE } } }
    : { opacity: 0, x: i < index ? -SLIDE : SLIDE, transition: { x: { duration: 0.4, ease: EASE }, opacity: { duration: 0.2, ease: EASE } } };
}

export function CasesSection() {
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // On phones the tab bar scrolls sideways: bring the chosen tab fully into view, moving only the bar, never the page.
  function revealTab(i: number) {
    const scroller = scrollerRef.current;
    const tab = tabRefs.current[i];
    if (!scroller || !tab || scroller.scrollWidth <= scroller.clientWidth) return;
    const inset = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
    const bar = scroller.getBoundingClientRect();
    const box = tab.getBoundingClientRect();
    if (box.left >= bar.left + inset - 1 && box.right <= bar.right - inset + 1) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: scroller.scrollLeft + box.left - bar.left - inset, behavior: instant ? "auto" : "smooth" });
  }

  function select(i: number) {
    setIndex(i);
    revealTab(i);
  }

  // The arrows cycle through all six and tell screen readers which case is now on show (focus stays on the arrow).
  function step(delta: 1 | -1) {
    const next = (index + delta + COUNT) % COUNT;
    select(next);
    setAnnouncement(ITEMS[next].name);
  }

  // Roving tabindex: Left and Right move between the tabs (wrapping), Home and End jump to the ends; the focused tab is shown.
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % COUNT;
        break;
      case "ArrowLeft":
        next = (index - 1 + COUNT) % COUNT;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = COUNT - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <Section id="use-cases">
      <Container>
        <Reveal>
          <div id={HEADING_ID}>
            <Heading title={CASES.title} accent={CASES.accent} className="max-w-[760px]" />
          </div>
          <p className="t-lead mt-6 max-w-[580px]">{CASES.text}</p>

          {/* Full bleed on phones so the tabs scroll edge to edge with snap; the padding keeps the first tab on the content
              edge and leaves room for the focus ring. From lg up all six fit and nothing scrolls. */}
          <motion.div
            ref={scrollerRef}
            layoutScroll
            className="-mx-5 mt-12 -mb-2 snap-x snap-mandatory scroll-px-5 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] md:-mx-8 md:mt-16 md:scroll-px-8 [&::-webkit-scrollbar]:hidden"
          >
            <div role="tablist" aria-labelledby={HEADING_ID} aria-orientation="horizontal" className="flex w-max gap-1 px-5 py-2 md:px-8">
              <AnimatedBackground
                value={String(index)}
                defaultValue="0"
                onValueChange={(id) => {
                  if (id !== null) select(Number(id));
                }}
                transition={{ duration: 0.4, ease: EASE }}
                className="rounded-2xl bg-sky/[0.14] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),inset_0_0_0_1px_rgb(105_191_248/0.35)]"
              >
                {ITEMS.map((item, i) => {
                  const selected = i === index;
                  return (
                    <button
                      key={item.name}
                      data-id={String(i)}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={tabId(i)}
                      aria-selected={selected}
                      aria-controls={panelId(i)}
                      aria-label={`${item.area} ${item.kind}`}
                      tabIndex={selected ? 0 : -1}
                      onKeyDown={onTabKeyDown}
                      className="group min-h-11 shrink-0 cursor-pointer snap-start rounded-2xl px-4 py-2.5 text-left transition-colors duration-200 ease-out hover:bg-white/[0.04] data-[checked=true]:hover:bg-transparent lg:px-5"
                    >
                      <span className="flex flex-col items-start">
                        <span className="text-[15px] leading-5 font-medium whitespace-nowrap text-white/75 transition-colors duration-200 group-hover:text-white group-data-[checked=true]:text-white">
                          {item.area}
                        </span>
                        <span className="mt-0.5 text-[13px] leading-[18px] whitespace-nowrap text-silver">{item.kind}</span>
                      </span>
                    </button>
                  );
                })}
              </AnimatedBackground>
            </div>
          </motion.div>
        </Reveal>

        {/* The section's one glass object and one of the page's two blurred surfaces. It animates itself: no Reveal around it. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
          className="glass glass-lit glass-blur mt-6 rounded-[36px] p-6 md:mt-8 md:p-12"
        >
          {/* Title bar: the case name (the same words as the chosen tab, so it is hidden from screen readers) and the arrows. */}
          <div className="flex items-center gap-3">
            <div aria-hidden className="grid min-w-0 flex-1">
              {ITEMS.map((item, i) => (
                <motion.p
                  key={item.name}
                  inert={i !== index}
                  initial={false}
                  animate={slideTo(i, index)}
                  className="col-start-1 row-start-1 text-[15px] leading-[1.4] font-medium text-sky"
                >
                  {item.name}
                </motion.p>
              ))}
            </div>
            <div className="flex shrink-0 gap-2">
              <PagerButton direction={-1} label="Vorheriges Praxisbeispiel" controls={panelId(index)} onClick={() => step(-1)} />
              <PagerButton direction={1} label="Nächstes Praxisbeispiel" controls={panelId(index)} onClick={() => step(1)} />
            </div>
          </div>

          <div aria-hidden className="rule mt-5 md:mt-8" />

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)] md:mt-10">
            {ITEMS.map((item, i) => {
              const active = i === index;
              return (
                <motion.div
                  key={item.name}
                  role="tabpanel"
                  id={panelId(i)}
                  aria-labelledby={tabId(i)}
                  aria-hidden={active ? undefined : true}
                  inert={!active}
                  tabIndex={active ? 0 : undefined}
                  initial={false}
                  animate={slideTo(i, index)}
                  className="col-start-1 row-start-1 rounded-2xl"
                >
                  <CaseBody item={item} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </Container>
    </Section>
  );
}

/**
 * One case as editorial type: headline and text, the three figures in a row (stacked on phones), then the quote and
 * the two quiet columns. From lg up the bottom row shares the figures' three columns, so everything lines up.
 */
function CaseBody({ item }: { item: CaseStudy }) {
  return (
    <>
      <h3 className="max-w-[780px] text-[clamp(1.75rem,1.2rem+1.5vw,2.375rem)] leading-[1.15] font-medium tracking-[-0.025em] text-balance text-white">
        {item.tagline}
      </h3>
      <p className="t-body mt-4 max-w-[620px]">{item.text}</p>

      <ul className="mt-10 md:mt-12 md:grid md:grid-cols-3">
        {item.metrics.map((metric, i) => (
          <li
            key={metric.label}
            className={cn(
              "md:px-6 lg:px-8",
              i === 0 && "md:pl-0 lg:pl-0",
              i > 0 && "md:border-l md:border-white/[0.08]",
              i === item.metrics.length - 1 && "md:pr-0 lg:pr-0"
            )}
          >
            {i > 0 ? <div aria-hidden className="rule my-6 md:hidden" /> : null}
            <p className="num text-[56px] leading-none whitespace-nowrap text-white lg:text-[64px]">{metric.value}</p>
            <p className="t-small mt-3 max-w-[16rem]">{metric.label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 md:mt-14 md:grid-cols-2 md:gap-x-6 lg:grid-cols-3 lg:gap-x-0">
        <figure className="border-l border-sky pl-5 md:col-span-2 lg:col-span-1 lg:mr-8">
          <blockquote>
            <p className="text-[18px] leading-[1.6] text-pretty text-white/90">„{item.quote}“</p>
          </blockquote>
          <figcaption className="mt-3 text-[14px] leading-[1.5] text-silver">
            <span aria-hidden>– </span>
            {item.role}
          </figcaption>
        </figure>

        <div className="lg:px-8">
          <h4 className="text-[14px] leading-[1.5] text-silver">{CASES.doneLabel}</h4>
          <ul className="mt-4 grid gap-2.5">
            {item.done.map((entry) => (
              <li key={entry} className="flex gap-3 text-[15px] leading-6 text-ink/85">
                <Check aria-hidden strokeWidth={1.5} className="mt-1 size-4 shrink-0 text-sky" />
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pl-8">
          <h4 className="text-[14px] leading-[1.5] text-silver">{CASES.toolsLabel}</h4>
          {/* Plain text joined by middle dots; each name stays whole and lines break only between tools. */}
          <ul className="mt-4 text-[15px] leading-7 text-ink/85">
            {item.tools.map((tool, i) => (
              <li key={tool} className="inline">
                <span className="whitespace-nowrap">
                  {tool}
                  {i < item.tools.length - 1 ? (
                    <span aria-hidden className="text-silver">
                      {" ·"}
                    </span>
                  ) : null}
                </span>
                {i < item.tools.length - 1 ? " " : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/** A 44px round arrow with a hairline border; it stays mounted while the case changes, so keyboard focus is never lost. */
function PagerButton({ direction, label, controls, onClick }: { direction: 1 | -1; label: string; controls: string; onClick: () => void }) {
  const iconClass = cn(
    "size-4 transition-transform duration-200 ease-out",
    direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
  );
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      onClick={onClick}
      className="group grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 text-ink/80 transition-[border-color,background-color,color,scale] duration-200 ease-out hover:border-white/35 hover:bg-white/[0.04] hover:text-white active:scale-[0.96]"
    >
      {direction === 1 ? (
        <ArrowRight aria-hidden strokeWidth={1.5} className={iconClass} />
      ) : (
        <ArrowLeft aria-hidden strokeWidth={1.5} className={iconClass} />
      )}
    </button>
  );
}
