"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { UC_ITEMS, UC_PROJECTS, type FilterId, type Project } from "@/content/pages/use-cases";
import { cn } from "@/lib/utils";
import { caseStore } from "./case-store";
import { CaseView } from "./case-view";
import { CoverArt } from "./cover-art";
import { layoutFor, type Boxes, type Layout } from "./poster-layout";
import { useLive } from "./use-live";

/*
  Projekte (2026-11-16). His heading pair and line, his five filter chips, and the seven projects as tall posters on
  one wall: an editorial arrangement of staggered columns (poster-layout.ts), each poster with its own cover art
  (cover-art.tsx), his number and industry line at its head, his name, one line and "Case Study öffnen" at its foot.

  Filtering: the posters that stay glide to their new places and the others fade out where they stood (CSS moves
  them: every place is known per screen size, so the wall needs no measuring). A poster opens the full case view
  (case-view.tsx). On a mouse the poster lifts and tilts a little towards the pointer.

  His filter on brandedgenius.de assigns no project to a topic (its buttons carry no filter value), so each project
  lists its topics in the copy file, taken from its own tags and solution points.
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const listFor = (id: FilterId) => (id === "all" ? UC_ITEMS : UC_ITEMS.filter((project) => project.topics.includes(id)));
const FIRST = layoutFor(UC_ITEMS);

type State = { filter: FilterId; boxes: Layout["boxes"]; height: Layout["height"]; moved: boolean };

export function ProjectsSection() {
  const [state, setState] = useState<State>({ filter: "all", boxes: FIRST.boxes, height: FIRST.height, moved: false });
  const order = useMemo(() => listFor(state.filter).map((project) => project.slug), [state.filter]);

  // Posters that leave keep their last place (they fade out there); the others take the new layout's places.
  const choose = (filter: FilterId) =>
    setState((prev) => {
      if (prev.filter === filter) return prev;
      const next = layoutFor(listFor(filter));
      return { filter, boxes: { ...prev.boxes, ...next.boxes }, height: next.height, moved: true };
    });

  const wall = {
    "--uc-hp": `${state.height.p}px`,
    "--uc-hm": `${state.height.m}px`,
    "--uc-hd": `${state.height.d}px`,
  } as CSSProperties;

  return (
    <Section id="projekte" className="-scroll-mt-12">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <Heading title={UC_PROJECTS.title} accent={UC_PROJECTS.accent} className="max-w-[700px] lg:col-span-7" />
          <p data-reveal="up" data-rd="2" className="t-lead max-w-[520px] lg:col-span-5 lg:col-start-8 lg:pb-1">
            {UC_PROJECTS.text}
          </p>
        </div>

        <div data-reveal="up" data-rd="2" className="uc-chips-wrap mt-10 md:mt-14">
          <div role="group" aria-label={UC_PROJECTS.filterLabel} className="uc-chips" data-lenis-prevent-horizontal>
            {UC_PROJECTS.filters.map((item) => {
              const on = state.filter === item.id;
              return (
                <button key={item.id} type="button" aria-pressed={on} onClick={() => choose(item.id)} className={cn("uc-chip", on && "is-on")}>
                  {on && (
                    <motion.span layoutId="uc-chip-on" aria-hidden className="uc-chip-on" transition={{ duration: 0.55, ease: EASE }} />
                  )}
                  <span className="relative">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="uc-wall mt-8 md:mt-12 lg:mt-16" style={wall}>
          {UC_ITEMS.map((project) => {
            const at = order.indexOf(project.slug);
            return <Poster key={project.slug} project={project} boxes={state.boxes[project.slug] as Boxes} order={Math.max(0, at)} hidden={at < 0} moved={state.moved} />;
          })}
        </div>
      </Container>
      <CaseView />
    </Section>
  );
}

function Poster({ project, boxes, order, hidden, moved }: { project: Project; boxes: Boxes; order: number; hidden: boolean; moved: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const frame = useRef(0);
  useLive(slot);

  const place = {
    "--pt": `${boxes.p.t}px`,
    "--ph": `${boxes.p.h}px`,
    "--pc": boxes.p.c,
    "--mt": `${boxes.m.t}px`,
    "--mh": `${boxes.m.h}px`,
    "--mc": boxes.m.c,
    "--dt": `${boxes.d.t}px`,
    "--dh": `${boxes.d.h}px`,
    "--dc": boxes.d.c,
    "--n": order,
  } as CSSProperties;

  // The tilt follows a mouse only; touch keeps the plain lift.
  const tilt = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const el = card.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    });
  };
  const settle = () => {
    cancelAnimationFrame(frame.current);
    card.current?.style.removeProperty("--rx");
    card.current?.style.removeProperty("--ry");
  };

  return (
    <div ref={slot} className="uc-poster uc-live" style={place} data-hidden={hidden ? "" : undefined} inert={hidden}>
      {/* Once the wall has been filtered, a poster coming back is shown at once (the wall fades it in itself). */}
      <article ref={card} className="uc-card" data-reveal="up" data-shown={moved ? "" : undefined} onPointerMove={tilt} onPointerLeave={settle}>
        <div className="uc-card-art">
          <CoverArt slug={project.slug} />
        </div>
        <div aria-hidden className="uc-card-scrim" />
        <div className="uc-card-head">
          <span className="num">{project.number}</span>
          <span className="uc-card-tag hidden md:block">{project.tag}</span>
        </div>
        <div className="uc-card-foot">
          <h3 className="uc-card-name">{project.name}</h3>
          <p className="uc-card-tag mt-1.5 md:hidden">{project.tag}</p>
          <p className="uc-card-line hidden md:block">{project.summary}</p>
        </div>
        {/* The whole poster is this button's target (its ::after covers the card). */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`${project.name}: ${UC_PROJECTS.open}`}
          onClick={(event) => caseStore.open(project.slug, event.currentTarget)}
          className="uc-card-open"
        >
          <span className="hidden md:inline">{UC_PROJECTS.open}</span>
          <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-4" />
        </button>
      </article>
    </div>
  );
}
