"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { Container, Heading, Section, TextLink } from "@/components/system/primitives";
import { Reveal } from "@/components/system/reveal";
import { CASES, LINKS, SOLUTION, type CaseStudy } from "@/content/site";
import { cn } from "@/lib/utils";

/*
  Use cases: six client results behind one tab bar. One case shows at a time in a large panel that crossfades on
  change. The tabs, the prev/next arrows and the keyboard all move through the same six.

  From tablet width up, every case is also laid out invisibly in the panel's grid cell, so the panel always has the
  height of the longest case and nothing below it moves when the case changes. On phones the panel is taller than the
  screen, so it simply takes the height of the case on show.

  The case name sits beside the arrows (desktop) and above the figures (phones), never above the tagline: a small
  label over a headline is an eyebrow, which the brief rules out.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const ITEMS = CASES.items;
const COUNT = ITEMS.length;
const PANEL_ID = "use-cases-panel";
const HEADING_ID = "use-cases-heading";
const tabId = (i: number) => `use-cases-tab-${i}`;

export function CasesSection() {
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = ITEMS[index];

  // On phones the tab bar scrolls sideways: bring the chosen tab fully into view, moving only the bar, never the page.
  function revealTab(i: number) {
    const scroller = scrollerRef.current;
    const tab = tabRefs.current[i];
    if (!scroller || !tab || scroller.scrollWidth <= scroller.clientWidth) return;
    const inset = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
    const bar = scroller.getBoundingClientRect();
    const box = tab.getBoundingClientRect();
    if (box.left >= bar.left + inset - 1 && box.right <= bar.right - inset + 1) return;
    scroller.scrollTo({ left: scroller.scrollLeft + box.left - bar.left - inset, behavior: reduce ? "auto" : "smooth" });
  }

  function select(i: number) {
    setIndex(i);
    revealTab(i);
  }

  // The arrows cycle through all six and tell screen readers which case is now on show.
  function step(delta: 1 | -1) {
    const next = (index + delta + COUNT) % COUNT;
    select(next);
    setAnnouncement(ITEMS[next].name);
  }

  // Left and right arrows move between tabs (wrapping), Home and End jump to the ends. The focused tab is the shown one.
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
            <Heading title={CASES.title} accent={CASES.accent} className="max-w-[820px]" />
          </div>
          <p className="t-lead mt-6 max-w-[620px]">{CASES.text}</p>
        </Reveal>

        <Reveal className="mt-14 md:mt-20" delay={0.08}>
          {/* Full bleed on phones so the pills scroll edge to edge; the inner padding keeps the first pill on the content edge
              and leaves room for the focus ring. */}
          <div
            ref={scrollerRef}
            className="-mx-5 -my-1.5 snap-x snap-mandatory scroll-px-5 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] md:-mx-8 md:scroll-px-8 [&::-webkit-scrollbar]:hidden"
          >
            <div role="tablist" aria-labelledby={HEADING_ID} className="flex w-max gap-2 px-5 py-1.5 md:px-8">
              {ITEMS.map((item, i) => {
                const selected = i === index;
                return (
                  <button
                    key={item.area}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(i)}
                    aria-selected={selected}
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    onKeyDown={onTabKeyDown}
                    className={cn(
                      "h-11 shrink-0 cursor-pointer snap-start rounded-full border px-5 text-[15px] whitespace-nowrap transition-[background-color,border-color,color,scale] duration-200 ease-out active:scale-[0.97]",
                      selected ? "border-white bg-white text-page" : "border-white/12 text-ink/70 hover:border-white/30 hover:text-ink"
                    )}
                  >
                    {/* The hidden medium-weight copy reserves the width, so no pill changes size when the weight changes. */}
                    <span className="grid justify-items-center">
                      <span className={cn("col-start-1 row-start-1", selected && "font-medium")}>{item.area}</span>
                      <span aria-hidden className="invisible col-start-1 row-start-1 font-medium">
                        {item.area}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="surface relative mt-6 rounded-[32px] md:mt-8">
            <div role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(index)} tabIndex={0} className="rounded-[32px] p-6 md:p-12">
              <div className="grid">
                {ITEMS.map((item) => (
                  <div key={item.area} aria-hidden className="invisible col-start-1 row-start-1 hidden md:block">
                    <CaseBody item={item} />
                  </div>
                ))}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.area}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
                    exit={{ opacity: 0, y: -12, transition: { duration: 0.2, ease: EASE } }}
                  >
                    <CaseBody item={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10 flex gap-2 md:top-12 md:right-12">
              <PagerButton direction={-1} label="Vorheriges Praxisbeispiel" onClick={() => step(-1)} />
              <PagerButton direction={1} label="Nächstes Praxisbeispiel" onClick={() => step(1)} />
            </div>
          </div>

          <div className="mt-8 flex md:mt-10">
            <TextLink href={LINKS.analysis} className="min-h-11">
              {SOLUTION.primary}
            </TextLink>
          </div>
        </Reveal>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
      </Container>
    </Section>
  );
}

/** One case: the story on the left, the figures and tools on the right (stacked on phones). */
function CaseBody({ item }: { item: CaseStudy }) {
  return (
    <div className="grid gap-y-10 pt-16 lg:grid-cols-12 lg:gap-x-16 lg:pt-0">
      <div className="lg:col-span-7">
        <h3 className="text-[clamp(1.75rem,1.25rem+1.5vw,2.5rem)] leading-[1.15] font-medium tracking-[-0.03em] text-balance text-white">
          {item.tagline}
        </h3>
        <p className="t-body mt-5">{item.text}</p>

        <figure className="mt-8 border-l-2 border-sky/40 pl-5">
          <blockquote>
            <p className="text-[18px] leading-[1.6] text-white/85">„{item.quote}“</p>
          </blockquote>
          <figcaption className="t-small mt-3">{item.role}</figcaption>
        </figure>

        <p className="mt-10 text-[14px] text-white/60">{CASES.doneLabel}</p>
        <ul className="mt-4 grid gap-3">
          {item.done.map((entry) => (
            <li key={entry} className="flex gap-3 text-[15px] leading-6 text-ink/85">
              <Check aria-hidden strokeWidth={1.5} className="mt-1 size-4 shrink-0 text-sky" />
              <span>{entry}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        {/* On desktop this row lines up with the arrows, which sit over its right end. */}
        <p className="text-[15px] font-medium text-sky lg:flex lg:min-h-11 lg:items-center lg:pr-28">{item.name}</p>

        <ul className="mt-5 lg:mt-6">
          {item.metrics.map((metric, i) => (
            <li key={metric.label}>
              {i > 0 ? <div aria-hidden className="hairline my-4 lg:my-6" /> : null}
              <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-4 lg:grid-cols-1 lg:items-start lg:gap-y-2">
                <p className="num text-[48px] leading-none text-white lg:text-[64px]">{metric.value}</p>
                <p className="t-small">{metric.label}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[14px] text-white/60">{CASES.toolsLabel}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {item.tools.map((tool) => (
            <li key={tool} className="inline-flex h-8 items-center rounded-full border border-white/12 px-3 text-[13px] text-ink/80">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A 44px round arrow button; it stays mounted while the panel content changes, so keyboard focus is never lost. */
function PagerButton({ direction, label, onClick }: { direction: 1 | -1; label: string; onClick: () => void }) {
  const iconClass = cn(
    "size-4 transition-transform duration-300 ease-out",
    direction === 1 ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
  );
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={PANEL_ID}
      onClick={onClick}
      className="group grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/[0.03] text-ink/80 transition-[border-color,background-color,color,scale] duration-200 ease-out hover:border-sky/30 hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
    >
      {direction === 1 ? (
        <ArrowRight aria-hidden strokeWidth={1.5} className={iconClass} />
      ) : (
        <ArrowLeft aria-hidden strokeWidth={1.5} className={iconClass} />
      )}
    </button>
  );
}
