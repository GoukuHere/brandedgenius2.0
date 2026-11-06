"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Heading } from "@/components/system/primitives";
import { RevealObserver } from "@/components/system/reveal-observer";
import { SmoothScroll } from "@/components/system/smooth-scroll";
import { CASES, CTA, HERO, LINKS, PROBLEM, SERVICES } from "@/content/site";
import { cn } from "@/lib/utils";
import { ConceptHeader, ConceptLink, Grain, HeroFilm, LegalLine, useReducedMotion } from "../shared";

/*
  Concept 2, "Der blaue Faden" (2026-11-07). One continuous canvas, no section blocks and no boxes. A thread of
  light in the brand gradient runs through the whole page and gives each part its shape, telling the client's own
  story from tool chaos to one system:
  - Hero: it sweeps in and loops round the film, then passes the claim (Strategisch, Automatisiert, Messbar).
  - Problem: the six problems are points on it, and between each two it is broken, like a cut cable: the tools are
    tested but never connected. Each point lights up as the thread reaches it.
  - Leistungen: it splits into four strands, one under each service, which meet again on the right.
  - Fallstudien: it becomes one straight line rising to the right, with the case's three results on it.
  - Kontakt: it ends at the main button, whose edge light carries it on.
  The thread draws itself as you read (its tip follows a line about two thirds down the screen), so it is always
  being drawn where you are looking. The canvas darkens nowhere and brightens towards the end: deep navy at the
  top, royal light around the results and the call to action.

  The paths are built from where the content actually is (measured anchors), so the thread fits any screen. On
  phones it runs down a gutter on the left and makes the same shapes there.
*/

type Pt = [number, number];
type Box = { x1: number; y1: number; x2: number; y2: number; w: number; h: number; cx: number; cy: number };
type Piece = { id: string; d: string; y0: number; y1: number; lane?: boolean };
type Station = { id: string; x: number; y: number; label: string; piece: string; at: number };
/** A bead at a cut end of a broken link; it shows once its half has been drawn to (or from) it. */
type Mark = { x: number; y: number; piece: string; at: number };
type Layout = { w: number; h: number; pieces: Piece[]; stations: Station[]; marks: Mark[] };

/**
 * The desktop chain: each link runs like a circuit trace, down beside its problem, across in the gap between two
 * problems (where it breaks, the second half a few pixels out of line), then down into the next point. It never
 * crosses the problems' text. `rows` are the problems' boxes; the gap between two rows is where a link crosses.
 */
function railChain(points: Pt[], rows: Box[], shift: number): { pieces: Piece[]; marks: Mark[] } {
  const pieces: Piece[] = [];
  const marks: Mark[] = [];
  for (let k = 0; k < points.length - 1; k++) {
    const a = points[k];
    const b = points[k + 1];
    const ym = rows[k].y2;
    const dir = Math.sign(b[0] - a[0]) || 1;
    const mid = (a[0] + b[0]) / 2;
    const cutA: Pt = [mid - 22 * dir, ym];
    const cutB: Pt = [mid + 22 * dir, ym + shift];
    pieces.push({ id: `p${k}a`, d: rounded([a, [a[0], ym], cutA], 24), y0: a[1] - 30, y1: ym });
    pieces.push({ id: `p${k}b`, d: rounded([cutB, [b[0], ym + shift], b], 24), y0: ym + 24, y1: b[1] });
    marks.push({ x: cutA[0], y: cutA[1], piece: `p${k}a`, at: 0.98 }, { x: cutB[0], y: cutB[1], piece: `p${k}b`, at: 0.02 });
  }
  return { pieces, marks };
}

/** The phone chain: straight down the gutter, broken between each two problems. */
function chain(points: Pt[], bend: number, shift: number): { pieces: Piece[]; marks: Mark[] } {
  const pieces: Piece[] = [];
  const marks: Mark[] = [];
  for (let k = 0; k < points.length - 1; k++) {
    const a = points[k];
    const b = points[k + 1];
    const link = brokenLink(a, b, k % 2 === 0 ? bend : -bend, shift);
    pieces.push({ id: `p${k}a`, d: link.first, y0: a[1] - 30, y1: link.cutA[1] });
    pieces.push({ id: `p${k}b`, d: link.second, y0: link.cutB[1] + 30, y1: b[1] });
    marks.push({ x: link.cutA[0], y: link.cutA[1], piece: `p${k}a`, at: 0.98 }, { x: link.cutB[0], y: link.cutB[1], piece: `p${k}b`, at: 0.02 });
  }
  return { pieces, marks };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const fx = (n: number) => n.toFixed(1);

/**
 * A smooth curve through the points (Catmull-Rom as cubic Béziers), from point `from` to point `to`. Cutting one
 * long route into pieces this way keeps every join smooth: each piece takes its tangents from the whole route.
 */
function smoothRange(pts: Pt[], from: number, to: number): string {
  let d = `M ${fx(pts[from][0])} ${fx(pts[from][1])}`;
  for (let i = from; i < to; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${fx(c1[0])} ${fx(c1[1])} ${fx(c2[0])} ${fx(c2[1])} ${fx(p2[0])} ${fx(p2[1])}`;
  }
  return d;
}
const smooth = (pts: Pt[]) => smoothRange(pts, 0, pts.length - 1);

/** Straight runs joined by rounded corners (radius r), for the parts of the thread that become rails. */
function rounded(pts: Pt[], r: number): string {
  let d = `M ${fx(pts[0][0])} ${fx(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py) || 1;
    const l2 = Math.hypot(nx - cx, ny - cy) || 1;
    const rr = Math.min(r, l1 / 2, l2 / 2);
    d += ` L ${fx(cx + ((px - cx) / l1) * rr)} ${fx(cy + ((py - cy) / l1) * rr)}`;
    d += ` Q ${fx(cx)} ${fx(cy)} ${fx(cx + ((nx - cx) / l2) * rr)} ${fx(cy + ((ny - cy) / l2) * rr)}`;
  }
  const end = pts[pts.length - 1];
  return `${d} L ${fx(end[0])} ${fx(end[1])}`;
}

/**
 * A link between two problems that is broken in the middle: the thread runs from one towards the next, stops, and
 * carries on from slightly out of line, like a cut cable. This is the problem section's own message ("Tools sind
 * nicht verbunden", tested but never productive); further down, under the services, the thread runs unbroken.
 * The link is a gentle curve (a quadratic Bézier bent sideways by `bend`); it is cut between 40% and 60% of its
 * way, and the second half starts `shift` px off the first half's line.
 */
function brokenLink(a: Pt, b: Pt, bend: number, shift: number) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const c: Pt = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
  const at = (t: number): Pt => {
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  };
  // The control point of the part between t0 and t1: the curve's point at t0 plus half the span along its tangent.
  const part = (t0: number, t1: number): [Pt, Pt, Pt] => {
    const p = at(t0);
    const d: Pt = [2 * (1 - t0) * (c[0] - a[0]) + 2 * t0 * (b[0] - c[0]), 2 * (1 - t0) * (c[1] - a[1]) + 2 * t0 * (b[1] - c[1])];
    const k = (t1 - t0) / 2;
    return [p, [p[0] + d[0] * k, p[1] + d[1] * k], at(t1)];
  };
  const [p0, c1, cutA] = part(0, 0.4);
  const [q0, c2, q1] = part(0.6, 1);
  const cutB: Pt = [q0[0] + nx * shift, q0[1] + ny * shift];
  const c2s: Pt = [c2[0] + nx * shift * 0.5, c2[1] + ny * shift * 0.5];
  const quad = (s: Pt, k: Pt, e: Pt) => `M ${fx(s[0])} ${fx(s[1])} Q ${fx(k[0])} ${fx(k[1])} ${fx(e[0])} ${fx(e[1])}`;
  return { first: quad(p0, c1, cutA), second: quad(cutB, c2s, q1), cutA, cutB };
}

/** Where the straight results line runs inside its box, as fractions: from its high right end to its low left end. */
const LINE = { from: [0.97, 0.1] as Pt, to: [0.02, 0.86] as Pt };
const ON_LINE = [0.2, 0.5, 0.8];
const linePoint = (t: number): Pt => [LINE.to[0] + (LINE.from[0] - LINE.to[0]) * t, LINE.to[1] + (LINE.from[1] - LINE.to[1]) * t];

type Anchors = {
  hero: Box;
  film: Box;
  problem: Box;
  /** The six problems' points, in order, and the problems' own boxes. */
  pnodes: Box[];
  pitems: Box[];
  servicesHead: Box;
  lanes: Box[];
  line: Box | null;
  nodes: Box[];
  button: Box;
};

function desktop(a: Anchors, w: number): Omit<Layout, "w" | "h"> {
  const { hero: H, film: F, pnodes, pitems, servicesHead: SH, lanes, button: B } = a;
  const line = a.line!;
  const pieces: Piece[] = [];

  // One route from the left edge, round the film and past the claim to the first problem; then the broken chain
  // through the six problems; then down the right margin, where the thread becomes rails (a spine down the left of
  // the services, one strand along the top of each service, a spine down the right where they meet again).
  const first = lanes[0];
  const last = lanes[lanes.length - 1];
  const leftX = first.x1 + 4;
  const rightX = Math.min(w - 30, SH.x2 + 34);
  const underY = SH.y2 + 40;
  const spineR = last.x2 + (w - last.x2) * 0.4;
  const mergeY = last.y2 + 30;
  const R = 36;
  const heroEnd: Pt = [F.x1 - 0.03 * F.w, H.y2 - 40];
  const points = pnodes.map((n): Pt => [n.cx, n.cy]);
  const p1 = points[0];
  const p6 = points[points.length - 1];
  const route: Pt[] = [
    [-40, H.y1 + 168],
    [w * 0.2, H.y1 + 140],
    [F.x1 + 0.08 * F.w, F.y1 + 4],
    [F.x1 + 0.55 * F.w, F.y1 - 22],
    [F.x2 - 0.04 * F.w, F.y1 + 0.15 * F.h],
    [F.x2 + 0.004 * F.w, F.y1 + 0.58 * F.h],
    [F.x1 + 0.76 * F.w, F.y2 + 18],
    [F.x1 + 0.36 * F.w, F.y2 + 44],
    heroEnd,
    [(heroEnd[0] + p1[0]) / 2, (heroEnd[1] + p1[1]) / 2 + 30],
    p1,
  ];
  pieces.push({ id: "hero", d: smoothRange(route, 0, 8), y0: H.y1 + 60, y1: heroEnd[1] });
  pieces.push({ id: "to-p1", d: smoothRange(route, 8, 10), y0: heroEnd[1], y1: p1[1] });
  const links = railChain(points, pitems, 9);
  pieces.push(...links.pieces);
  // From the last problem down past its text, across to the right margin, then back under the Leistungen header to
  // the rails, unbroken from here on.
  const below = pitems[pitems.length - 1].y2;
  pieces.push({
    id: "to-split",
    d: rounded([p6, [p6[0], below], [rightX, below], [rightX, underY], [leftX, underY], [leftX, first.y1]], 48),
    y0: p6[1] + 10,
    y1: first.y1 - 40,
  });
  pieces.push({ id: "spine-l", d: rounded([[leftX, first.y1 - 8], [leftX, last.y1]], R), y0: first.y1 - 120, y1: last.y1 - 60 });
  lanes.forEach((lane, i) => {
    const y = lane.y1;
    pieces.push({ id: `lane-${i}`, lane: true, d: rounded([[leftX, y - R], [leftX, y], [spineR, y], [spineR, y + R]], R), y0: y - 280, y1: y + 40 });
  });
  pieces.push({ id: "spine-r", d: rounded([[spineR, first.y1 + R - 6], [spineR, mergeY]], R), y0: first.y1 - 40, y1: mergeY - 60 });

  // Down to the results line, along it (rising to the right, drawn from its high end), then round the closing
  // headline to the main button.
  const start: Pt = [line.x1 + LINE.from[0] * line.w, line.y1 + LINE.from[1] * line.h];
  const end: Pt = [line.x1 + LINE.to[0] * line.w, line.y1 + LINE.to[1] * line.h];
  const len = Math.hypot(start[0] - end[0], start[1] - end[1]);
  const dir: Pt = [(end[0] - start[0]) / len, (end[1] - start[1]) / len];
  const pre: Pt = [start[0] - dir[0] * 70, start[1] - dir[1] * 70];
  const post: Pt = [end[0] + dir[0] * 40, end[1] + dir[1] * 40];
  pieces.push({ id: "to-line", d: rounded([[spineR, mergeY], [spineR, pre[1] - 40], pre, start], 56), y0: mergeY - 40, y1: start[1] });
  pieces.push({ id: "line", d: `M ${fx(start[0])} ${fx(start[1])} L ${fx(end[0])} ${fx(end[1])}`, y0: start[1] - 80, y1: end[1] });
  pieces.push({
    id: "to-cta",
    d: rounded([end, post, [post[0], B.y1 - 64], [B.cx, B.y1 - 64], [B.cx, B.y1 - 2]], 48),
    y0: end[1],
    y1: B.y1,
  });

  // The claim, as three stations on the thread where it leaves the film.
  const stations: Station[] = HERO.claim.map((label, i) => ({ id: `claim-${i}`, x: 0, y: 0, label, piece: "hero", at: 0.82 + i * 0.07 }));
  return { pieces, stations, marks: links.marks };
}

function phone(a: Anchors, w: number): Omit<Layout, "w" | "h"> {
  const { hero: H, film: F, pnodes, servicesHead: SH, lanes, nodes, button: B } = a;
  const g = 16; // the gutter the thread runs down
  const pieces: Piece[] = [];
  const heroEnd: Pt = [g, H.y2];
  const points = pnodes.map((n): Pt => [n.cx, n.cy]);
  const p1 = points[0];
  const p6 = points[points.length - 1];
  const split: Pt = [g, SH.y2 + 20];
  const route: Pt[] = [
    [-20, F.y1 - 26],
    [w * 0.3, F.y1 - 10],
    [w * 0.84, F.y1 - 4],
    [w - 10, F.y1 + 0.5 * F.h],
    [w * 0.72, F.y2 + 6],
    [w * 0.3, F.y2 + 14],
    [g, F.y2 + 64],
    [g, F.y2 + 140],
    heroEnd,
    [g, (heroEnd[1] + p1[1]) / 2],
    p1,
  ];
  pieces.push({ id: "hero", d: smoothRange(route, 0, 8), y0: F.y1 - 20, y1: heroEnd[1] });
  pieces.push({ id: "to-p1", d: smoothRange(route, 8, 10), y0: heroEnd[1] - 200, y1: p1[1] });
  // Down the gutter through the six problems, broken between each two.
  const links = chain(points, 0, 7);
  pieces.push(...links.pieces);
  pieces.push({ id: "to-split", d: smooth([p6, [g, (p6[1] + split[1]) / 2], split]), y0: p6[1] + 10, y1: split[1] });
  lanes.forEach((lane, i) => {
    const y = lane.y1;
    pieces.push({ id: `lane-${i}`, lane: true, d: rounded([[g, y - 24], [g, y], [w - 20, y]], 20), y0: y - 260, y1: y + 40 });
  });
  // The trunk: down the gutter past each result to the main button.
  const trunk: Pt[] = [split, [g, lanes[lanes.length - 1].y2]];
  nodes.forEach((n) => trunk.push([g, n.cy]));
  trunk.push([g, B.y1 - 90], [B.cx, B.y1 - 30], [B.cx, B.y1 - 2]);
  pieces.push({ id: "trunk", d: smooth(trunk), y0: split[1], y1: B.y1 });
  return { pieces, stations: [], marks: links.marks };
}

/** Measures the anchors (data-thread) inside the root and builds the thread; again whenever the layout changes. */
function useThreadLayout(root: RefObject<HTMLDivElement | null>) {
  const [layout, setLayout] = useState<Layout | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    let raf = 0;
    const build = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const box = (node: Element | null): Box | null => {
        if (!node) return null;
        const b = node.getBoundingClientRect();
        if (!b.width && !b.height) return null;
        const x1 = b.left - r.left;
        const y1 = b.top - r.top;
        return { x1, y1, x2: x1 + b.width, y2: y1 + b.height, w: b.width, h: b.height, cx: x1 + b.width / 2, cy: y1 + b.height / 2 };
      };
      const one = (name: string) => box(el.querySelector(`[data-thread="${name}"]`));
      const all = (name: string) => [...el.querySelectorAll(`[data-thread="${name}"]`)].map(box).filter((b): b is Box => !!b);
      const hero = one("hero");
      const film = one("film");
      const problem = one("problem");
      const pnodes = all("pnode");
      const pitems = all("pitem");
      const servicesHead = one("services-head");
      const lanes = all("lane");
      const button = one("button");
      if (!hero || !film || !problem || pnodes.length < 2 || pitems.length !== pnodes.length || !servicesHead || lanes.length < 2 || !button) return;
      const anchors: Anchors = { hero, film, problem, pnodes, pitems, servicesHead, lanes, line: one("line"), nodes: all("node"), button };
      const w = r.width;
      const wide = w >= 1024 && !!anchors.line;
      const built = wide ? desktop(anchors, w) : phone(anchors, w);
      // A piece at the very foot of the page must still finish: its last reading position has to be reachable.
      const maxRead = el.scrollHeight - window.innerHeight * 0.36 - 12;
      const pieces = built.pieces.map((p) => {
        const y1 = Math.min(p.y1, maxRead);
        return { ...p, y1, y0: Math.min(p.y0, y1 - 60) };
      });
      setLayout({ w, h: el.scrollHeight, pieces, stations: built.stations, marks: built.marks });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(build);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [root]);
  return layout;
}

/** The thread itself: layered strokes for the glow, the brand gradient body and a bright core, plus a tip per piece. */
function Thread({ root, layout }: { root: RefObject<HTMLDivElement | null>; layout: Layout }) {
  const svg = useRef<SVGSVGElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const el = svg.current;
    const host = root.current;
    if (!el || !host) return undefined;
    const pieces = layout.pieces.map((p) => {
      const paths = [...el.querySelectorAll<SVGPathElement>(`[data-piece="${p.id}"]`)];
      const len = paths[0]?.getTotalLength() ?? 1;
      paths.forEach((path) => {
        path.style.strokeDasharray = `${len} ${len + 2}`;
      });
      return { ...p, paths, len, tip: el.querySelector<SVGGElement>(`[data-tip="${p.id}"]`), cur: 0 };
    });

    // The claim stations sit on the hero piece; their positions come from the drawn path.
    const hero = pieces.find((p) => p.id === "hero");
    if (hero?.paths[0]) {
      setStations(
        layout.stations.map((s) => {
          const pt = hero.paths[0].getPointAtLength(hero.len * s.at);
          return { ...s, x: pt.x, y: pt.y };
        })
      );
    }

    let raf = 0;
    const frame = () => {
      raf = 0;
      const top = host.getBoundingClientRect().top;
      const read = window.innerHeight * 0.64 - top;
      let moving = false;
      for (const p of pieces) {
        const target = reduced ? 1 : clamp01((read - p.y0) / Math.max(1, p.y1 - p.y0));
        const next = p.cur + (target - p.cur) * 0.12;
        p.cur = Math.abs(target - next) < 0.0006 ? target : next;
        if (p.cur !== target) moving = true;
        const offset = p.len * (1 - p.cur);
        for (const path of p.paths) path.style.strokeDashoffset = `${offset}`;
        if (p.tip) {
          const live = p.cur > 0.004 && p.cur < 0.996;
          if (live && p.paths[0]) {
            const pt = p.paths[0].getPointAtLength(p.len * p.cur);
            p.tip.setAttribute("transform", `translate(${fx(pt.x)} ${fx(pt.y)})`);
          }
          p.tip.style.opacity = live ? "1" : "0";
        }
      }
      // The claim lights station by station as the thread passes it.
      const heroCur = hero?.cur ?? 0;
      labels.current?.querySelectorAll<HTMLElement>("[data-at]").forEach((node) => {
        node.dataset.on = heroCur >= Number(node.dataset.at) ? "1" : "0";
      });
      // The beads at the cut ends appear once their half has been drawn to (or from) them.
      el.querySelectorAll<SVGCircleElement>("[data-mark]").forEach((mark) => {
        const p = pieces.find((x) => x.id === mark.dataset.mark);
        const at = Number(mark.dataset.at);
        mark.style.opacity = p && (at > 0.5 ? p.cur >= at : p.cur > at) ? "1" : "0";
      });
      // Each problem lights up when the thread reaches it.
      host.querySelectorAll<HTMLElement>("[data-thread='pnode']").forEach((node) => {
        const r = node.getBoundingClientRect();
        node.dataset.on = reduced || read >= r.top + r.height / 2 - top - 6 ? "1" : "0";
      });
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [layout, root, reduced]);

  return (
    <>
      <svg ref={svg} aria-hidden className="pointer-events-none absolute top-0 left-0 z-[5]" width={layout.w} height={layout.h} viewBox={`0 0 ${layout.w} ${layout.h}`} fill="none">
        <defs>
          <linearGradient id="c2-body" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={layout.h}>
            <stop offset="0" stopColor="#2a7fe8" />
            <stop offset="0.45" stopColor="#4a9cf2" />
            <stop offset="0.8" stopColor="#69bff8" />
            <stop offset="1" stopColor="#b9e2ff" />
          </linearGradient>
          <linearGradient id="c2-lane" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={layout.w} y2="0">
            <stop offset="0" stopColor="#1a6fe0" />
            <stop offset="1" stopColor="#8fd0ff" />
          </linearGradient>
          <radialGradient id="c2-tip">
            <stop offset="0" stopColor="#69bff8" stopOpacity="0.75" />
            <stop offset="1" stopColor="#69bff8" stopOpacity="0" />
          </radialGradient>
        </defs>
        {layout.pieces.map((p) => (
          <g key={p.id} strokeLinecap="round" strokeLinejoin="round">
            {/* The glow layers end flat, so two pieces meeting end to end don't double their glow into a ring. */}
            <path data-piece={p.id} d={p.d} stroke="#69bff8" strokeOpacity="0.06" strokeWidth="22" strokeLinecap="butt" />
            <path data-piece={p.id} d={p.d} stroke="#69bff8" strokeOpacity="0.14" strokeWidth="8" strokeLinecap="butt" />
            <path data-piece={p.id} d={p.d} stroke={p.lane ? "url(#c2-lane)" : "url(#c2-body)"} strokeWidth="2.6" />
            <path data-piece={p.id} d={p.d} stroke="#eaf6ff" strokeOpacity="0.8" strokeWidth="1" />
          </g>
        ))}
        {layout.marks.map((m, i) => (
          <circle key={`mark-${i}`} data-mark={m.piece} data-at={m.at} cx={m.x} cy={m.y} r="3.4" fill="#b9e2ff" style={{ opacity: 0, transition: "opacity 300ms" }} />
        ))}
        {layout.pieces.map((p) => (
          <g key={`tip-${p.id}`} data-tip={p.id} style={{ opacity: 0, transition: "opacity 300ms" }}>
            <circle r="14" fill="url(#c2-tip)" />
            <circle r="2.6" fill="#ffffff" />
          </g>
        ))}
      </svg>
      <div ref={labels} aria-hidden className="pointer-events-none absolute inset-0 z-[11] hidden lg:block">
        {stations.map((s) => (
          <span
            key={s.id}
            data-at={s.at}
            data-on="0"
            className="c2-station absolute flex items-center gap-3 text-[17px] font-medium tracking-[-0.01em] text-white"
            style={{ left: s.x, top: s.y }}
          >
            <span className="size-[7px] rounded-full bg-sky shadow-[0_0_14px_rgb(105_191_248/0.9)]" />
            {s.label}
          </span>
        ))}
      </div>
    </>
  );
}

/* ---------- The content ---------- */

const LEAD = `${HERO.text.split(" für ")[0]}.`;

/*
  Layers inside the canvas: each section's light (-z-10) under the grain (1), the thread (5), the film (6, so the
  thread passes behind Roman), then the text (10) and the claim stations (11). Sections set no z-index of their
  own, so all of these share the canvas's one stacking context.
*/
function Hero() {
  return (
    <section id="top" data-thread="hero" className="relative min-h-[760px] lg:min-h-[900px]">
      <div aria-hidden className="pointer-events-none absolute -inset-x-[10%] -top-[10%] -z-10 h-[130%] bg-[radial-gradient(48%_46%_at_70%_44%,rgb(0_75_160/0.55),rgb(0_75_160/0)_72%)]" />
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        data-thread="film"
        className="c2-film absolute inset-x-0 top-[70px] z-[6] aspect-video lg:inset-x-auto lg:top-[150px] lg:right-[3%] lg:w-[54%]"
      >
        <HeroFilm className="absolute inset-0" sizes="(min-width: 1024px) 54vw, 100vw" />
      </motion.div>
      <div className="relative z-10 mx-auto max-w-[1360px] pt-[calc(56vw+84px)] pr-6 pb-16 pl-10 lg:px-12 lg:pt-[296px] lg:pb-0">
        <div className="max-w-[560px]">
          <Heading as="h1" size="display" title={HERO.title} accent={HERO.accent} />
          <p data-reveal="up" data-rd="3" className="t-lead mt-6 max-w-[480px]">
            {LEAD}
          </p>
          <div data-reveal="up" data-rd="4" className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ConceptLink href={LINKS.analysis} variant="comet">
              {HERO.primary}
            </ConceptLink>
            <ConceptLink href={LINKS.booking} variant="ghost">
              {HERO.secondary}
            </ConceptLink>
          </div>
          <p data-reveal="up" data-rd="5" className="mt-10 flex flex-wrap gap-x-5 gap-y-1 text-[17px] font-medium text-white/80 lg:hidden">
            {HERO.claim.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/*
  The problems are points on the thread, and the thread between them is broken: it runs halfway, stops, and goes on
  out of line. That is the section's message (tested but not productive, tools not connected); under the services
  the thread runs unbroken. On a desktop the points zig-zag down the right; on a phone they sit in the gutter.
*/
function Problem() {
  return (
    <section id="problem" data-thread="problem" className="relative">
      <div aria-hidden className="pointer-events-none absolute top-1/2 right-[-6%] -z-10 h-[90%] w-[70%] -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(0_75_160/0.3),rgb(0_75_160/0))]" />
      <div className="relative z-10 mx-auto grid max-w-[1360px] grid-cols-1 gap-x-16 pt-24 pr-6 pb-24 pl-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-12 lg:pt-36 lg:pb-40">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Heading title={PROBLEM.title} accent={PROBLEM.accent} />
          <p data-reveal="up" data-rd="2" className="t-body mt-6 max-w-[440px]">
            {PROBLEM.text}
          </p>
        </div>
        <ol className="mt-10 lg:mt-0">
          {PROBLEM.items.map((item, i) => (
            <li key={item.title} data-thread="pitem" className={cn("relative flex items-start gap-5 py-5 lg:py-8", i % 2 === 1 && "lg:pl-[38%]")}>
              <span data-thread="pnode" data-on="0" className="c2-node absolute top-[27px] -left-[30.5px] lg:static lg:mt-[7px]" />
              <span className="min-w-0">
                <span className="num block text-[13px] text-sky">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 block text-[18px] leading-[1.3] font-medium text-white lg:text-[20px]">{item.title}</span>
                <span className="mt-1.5 block max-w-[380px] text-[15px] leading-[1.5] text-white/58">{item.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="leistungen" className="relative">
      <div aria-hidden className="pointer-events-none absolute top-[20%] left-[-20%] -z-10 h-[80%] w-[70%] bg-[radial-gradient(closest-side,rgb(26_111_224/0.22),rgb(26_111_224/0))]" />
      <div className="relative z-10 mx-auto max-w-[1360px] pt-16 pr-6 pb-24 pl-10 lg:px-12 lg:pt-24 lg:pb-36">
      <div data-thread="services-head" className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <Heading title={SERVICES.title} accent={SERVICES.accent} />
        <p data-reveal="up" data-rd="2" className="t-body max-w-[460px]">
          {SERVICES.text}
        </p>
      </div>
      <div className="mt-14 lg:mt-24">
        {SERVICES.items.map((item, i) => (
          <div key={item.id} data-thread="lane" className="grid gap-3 pt-8 pb-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:pt-10 lg:pb-14 lg:pl-[9%]">
            <h3 data-reveal="up" className="flex items-baseline gap-4">
              <span className="num w-6 shrink-0 text-[14px] text-sky">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[21px] leading-[1.25] font-medium tracking-[-0.015em] text-white lg:text-[26px]">{item.title}</span>
            </h3>
            <div data-reveal="up" data-rd="1" className="pl-10 lg:pl-0">
              <p className="max-w-[520px] text-[16px] leading-[1.6] text-white/70 lg:text-[17px]">{item.text}</p>
              <a
                href={LINKS.contact}
                target="_blank"
                rel="noopener"
                className="group mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-white transition-colors hover:text-sky"
              >
                {item.cta}
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

function Results() {
  const [active, setActive] = useState(0);
  const study = CASES.items[active];
  return (
    <section id="fallstudien" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[25%] -z-10 h-[90%] bg-[radial-gradient(60%_50%_at_50%_55%,rgb(26_111_224/0.38),rgb(26_111_224/0)_75%)]" />
      <div className="relative z-10 mx-auto max-w-[1360px] pt-20 pr-6 pb-16 pl-10 lg:px-12 lg:pt-28 lg:pb-20">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <Heading title={CASES.title} accent={CASES.accent} />
        <p data-reveal="up" data-rd="2" className="t-body max-w-[460px]">
          {CASES.text}
        </p>
      </div>
      <div role="tablist" aria-label="Fallstudien" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 lg:mt-14 lg:gap-x-9">
        {CASES.items.map((c, i) => (
          <button
            key={c.area}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn("relative cursor-pointer pb-2 text-[15px] font-medium transition-colors", i === active ? "text-white" : "text-white/45 hover:text-white/80")}
          >
            {c.area}
            {i === active && <motion.span layoutId="c2-case" className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-sky" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`tag-${active}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="mt-8 max-w-[560px] text-[21px] leading-[1.3] font-medium tracking-[-0.015em] text-white lg:text-[28px]"
        >
          {study.tagline}
        </motion.p>
      </AnimatePresence>

      {/* Desktop: the three results sit on the straight line, rising to the right. */}
      <div data-thread="line" className="relative mt-4 hidden h-[440px] lg:block">
        {study.metrics.map((m, k) => {
          const [x, y] = linePoint(ON_LINE[k]);
          return (
            <div key={`${active}-${m.label}`} className="absolute" style={{ left: `${x * 100}%`, top: `${y * 100}%` }}>
              <span aria-hidden className="absolute -top-[5px] -left-[5px] size-[10px] rounded-full bg-white shadow-[0_0_18px_4px_rgb(105_191_248/0.7)]" />
              <span className="absolute right-4 bottom-5 block overflow-hidden pb-[0.05em]">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.1 + k * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="num block text-[clamp(56px,5.6vw,88px)] leading-none whitespace-nowrap text-white"
                >
                  {m.value}
                </motion.span>
              </span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + k * 0.1 }}
                className="absolute top-4 left-4 w-[220px] text-[15px] leading-[1.45] text-white/65"
              >
                {m.label}
              </motion.p>
            </div>
          );
        })}
      </div>

      {/* Phones: the results down the thread's gutter. */}
      <div className="mt-8 grid gap-7 lg:hidden">
        {study.metrics.map((m) => (
          <div key={`${active}-${m.label}`} data-thread="node" className="relative">
            <span aria-hidden className="absolute top-1/2 -left-[29px] size-[9px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_3px_rgb(105_191_248/0.7)]" />
            <p className="num text-[48px] leading-none text-white">{m.value}</p>
            <p className="mt-2 text-[15px] leading-[1.45] text-white/65">{m.label}</p>
          </div>
        ))}
      </div>

      <figure className="mt-12 max-w-[460px] lg:mt-6 lg:ml-auto">
        <blockquote className="text-[17px] leading-[1.6] text-white/85 lg:text-[18px]">„{study.quote}“</blockquote>
        <figcaption className="mt-3 text-[14px] text-silver">{study.role}</figcaption>
      </figure>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="kontakt" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(45%_55%_at_50%_45%,rgb(105_191_248/0.2),rgb(105_191_248/0)_72%)]" />
      <div className="relative z-10 mx-auto max-w-[1360px] pt-28 pr-6 pb-8 pl-10 text-center lg:px-12 lg:pt-44">
      <Heading title={CTA.title} accent={CTA.accent} className="mx-auto max-w-[760px]" />
      <div data-reveal="up" data-rd="3" className="mt-24 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-28">
        <span data-thread="button" className="inline-flex">
          <ConceptLink href={LINKS.contact} variant="comet">
            {CTA.primary}
          </ConceptLink>
        </span>
        <ConceptLink href={LINKS.booking} variant="ghost">
          {CTA.secondary}
        </ConceptLink>
      </div>
      <ul data-reveal-group className="mt-10 flex flex-col items-center justify-center gap-x-8 gap-y-2 text-[14px] text-white/60 sm:flex-row">
        {CTA.checks.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <LegalLine className="mt-28 border-t border-white/10 pt-6 text-left" />
      </div>
    </section>
  );
}

export function ThreadConcept() {
  const root = useRef<HTMLDivElement>(null);
  const layout = useThreadLayout(root);
  return (
    <>
      <div aria-hidden className="c2-fade-top pointer-events-none fixed inset-x-0 top-0 z-40 h-[110px]" />
      <ConceptHeader />
      <main>
        <div ref={root} className="c-root c2-canvas overflow-x-clip">
          <Grain className="z-[1]" />
          {layout && <Thread root={root} layout={layout} />}
          <Hero />
          <Problem />
          <Services />
          <Results />
          <Contact />
        </div>
      </main>
      <RevealObserver />
      <SmoothScroll />
    </>
  );
}
