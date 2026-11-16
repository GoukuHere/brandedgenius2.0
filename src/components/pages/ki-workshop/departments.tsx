"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Container, Heading, Section } from "@/components/system/primitives";
import { KW_DEPARTMENTS } from "@/content/pages/ki-workshop";

/*
  Bereiche: an org chart. The root node is his "Fokusbereich für Ihr Team" and shows the department in focus with his
  line for it; thin sky lines branch from it to the six departments. The lines draw when the chart comes into view
  (the middle branches first). Selecting a department (hover, focus, tap) lights its branch from the root down to it
  and the root shows its line; Geschäftsführung is selected at first.

  Desktop: the root centred above a row of six nodes, the branches running down, across and down again with rounded
  turns. Phones: a vertical tree, a trunk down the left from the root with a short branch into each node.
  The lines are one SVG behind the nodes; their points are measured from the nodes themselves (ResizeObserver), so no
  width is assumed. Semantics: a tab list (the six departments) and its panel (the root).
*/

const ITEMS = KW_DEPARTMENTS.items;
const HOVER_INTENT_MS = 90;
const TRUNK_X = 22; // phones: the trunk's distance from the left edge
const r1 = (v: number) => Math.round(v * 10) / 10;

type Point = { x: number; y: number };
type Geo = { w: number; h: number; wide: boolean; port: Point; ends: Point[]; paths: string[] };

/** Desktop: down from the root, across on a bus halfway, down into the node, with rounded turns. */
function branchDown(from: Point, to: Point) {
  const bus = from.y + (to.y - from.y) / 2;
  const dx = to.x - from.x;
  if (Math.abs(dx) < 1) return `M${r1(from.x)} ${r1(from.y)} V${r1(to.y)}`;
  const k = Math.min(14, Math.abs(dx) / 2, (to.y - from.y) / 4);
  const s = Math.sign(dx);
  return [
    `M${r1(from.x)} ${r1(from.y)}`,
    `V${r1(bus - k)}`,
    `Q${r1(from.x)} ${r1(bus)} ${r1(from.x + s * k)} ${r1(bus)}`,
    `H${r1(to.x - s * k)}`,
    `Q${r1(to.x)} ${r1(bus)} ${r1(to.x)} ${r1(bus + k)}`,
    `V${r1(to.y)}`,
  ].join(" ");
}

/** Phones: down the trunk, then a short branch to the right into the node. */
function branchSide(from: Point, to: Point) {
  const k = Math.min(12, (to.y - from.y) / 2, (to.x - from.x) / 2);
  return `M${r1(from.x)} ${r1(from.y)} V${r1(to.y - k)} Q${r1(from.x)} ${r1(to.y)} ${r1(from.x + k)} ${r1(to.y)} H${r1(to.x)}`;
}

export function KwDepartments() {
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hover = useRef<number | undefined>(undefined);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [ready, setReady] = useState(false);
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  useEffect(() => {
    const el = stage.current;
    const top = root.current;
    if (!el || !top) return undefined;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const card = top.getBoundingClientRect();
      const nodes = tabs.current.map((tab) => tab?.getBoundingClientRect() ?? null);
      if (nodes.some((node) => !node)) return;
      const rects = nodes as DOMRect[];
      const wide = rects.length > 1 && Math.abs(rects[0].top - rects[1].top) < 4;
      const port = wide ? { x: card.left + card.width / 2 - base.left, y: card.bottom - base.top } : { x: TRUNK_X, y: card.bottom - base.top };
      const ends = rects.map((node) =>
        wide ? { x: node.left + node.width / 2 - base.left, y: node.top - base.top } : { x: node.left - base.left, y: node.top + node.height / 2 - base.top }
      );
      const paths = ends.map((end) => (wide ? branchDown(port, end) : branchSide(port, end)));
      setGeo({ w: base.width, h: base.height, wide, port, ends, paths });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) measure();
    });

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setDrawn(true);
        timer = window.setTimeout(() => setReady(true), 1200);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      alive = false;
      ro.disconnect();
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(hover.current), []);

  const select = (index: number) => {
    window.clearTimeout(hover.current);
    setActive(index);
  };
  // Mouse only: a pointer passing over the row does not flick every branch; touch selects by tapping.
  const hoverSelect = (index: number, pointerType: string) => {
    if (pointerType !== "mouse") return;
    window.clearTimeout(hover.current);
    hover.current = window.setTimeout(() => setActive(index), HOVER_INTENT_MS);
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = ITEMS.length - 1;
    const next = index === last ? 0 : index + 1;
    const prev = index === 0 ? last : index - 1;
    const keys: Record<string, number> = { ArrowRight: next, ArrowDown: next, ArrowLeft: prev, ArrowUp: prev, Home: 0, End: last };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    tabs.current[target]?.focus();
  };

  const item = ITEMS[active];

  return (
    <Section id="bereiche">
      <Container>
        <div className="mx-auto max-w-[820px] text-center">
          <Heading title={KW_DEPARTMENTS.title} accent={KW_DEPARTMENTS.accent} className="kw-break kw-center" />
        </div>

        <div ref={stage} data-drawn={drawn ? "" : undefined} className="kw-org relative mt-12 md:mt-16 lg:mt-20">
          <svg
            aria-hidden
            width={geo?.w ?? 0}
            height={geo?.h ?? 0}
            viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
            className="pointer-events-none absolute inset-0 overflow-visible"
          >
            {geo?.paths.map((d, i) => (
              <path
                key={`${i}-${geo.wide}`}
                d={d}
                pathLength={1}
                className="kw-org-line"
                style={{ "--d": geo.wide ? Math.floor(Math.abs(i - (ITEMS.length - 1) / 2)) : i } as CSSProperties}
              />
            ))}
            {geo && (
              <g key={`${active}-${geo.wide}`} style={{ "--on-delay": ready ? "0ms" : "1100ms" } as CSSProperties}>
                <path d={geo.paths[active]} pathLength={1} className="kw-org-on" />
                <circle cx={geo.port.x} cy={geo.port.y} r={3} className="kw-org-dot" />
                <circle cx={geo.ends[active].x} cy={geo.ends[active].y} r={3} className="kw-org-dot" />
              </g>
            )}
          </svg>

          {/* The root: the department in focus. */}
          <div
            ref={root}
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${baseId}-tab-${active}`}
            className="kw-org-root relative mx-auto w-full max-w-[640px] px-6 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8 lg:text-center"
          >
            <div key={active} className="kw-swap lg:min-h-[96px]">
              <h3 className="text-[22px] leading-[1.2] font-medium tracking-[-0.015em] text-white lg:text-[26px]">{item.title}</h3>
              <p className="mt-2 text-[16px] leading-[1.55] text-white/75 lg:mx-auto lg:max-w-[480px] lg:text-[17px]">{item.text}</p>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[13px] leading-none text-sky lg:justify-center">
              <span aria-hidden className="size-1.5 rounded-full bg-sky shadow-[0_0_10px_rgb(105_191_248/0.9)]" />
              {KW_DEPARTMENTS.root}
            </p>
          </div>

          {/* The six departments. */}
          <div role="tablist" aria-label={KW_DEPARTMENTS.root} className="relative mt-8 grid gap-2.5 pl-12 lg:mt-24 lg:grid-cols-6 lg:gap-4 lg:pl-0">
            {ITEMS.map((dept, i) => {
              const on = i === active;
              return (
                <button
                  key={dept.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={panelId}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onFocus={() => select(i)}
                  onKeyDown={(event) => onKey(event, i)}
                  onPointerEnter={(event) => hoverSelect(i, event.pointerType)}
                  onPointerLeave={() => window.clearTimeout(hover.current)}
                  className="kw-org-node h-[50px] lg:h-[72px] lg:justify-center lg:px-3 lg:text-center"
                >
                  {dept.title}
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
