import type { Project, ProjectSlug } from "@/content/pages/use-cases";

/*
  Where each poster stands, for any set of visible projects, on the three screen sizes: phones ("p", two columns),
  tablets ("m", two columns) and desktop ("d", three columns). Pure numbers from the list alone, so the server and the
  browser agree, and every screen size is known up front (CSS picks one with media queries, see use-cases.css).

  Desktop: the posters fill the columns row by row; a last row of one goes to the middle column, of two to the outer
  ones, so every set is balanced around the centre. The fullest column sets the height; a column with fewer posters
  gets taller posters (up to CAP) and is centred against it. The columns then step down from left to right (STAGGER),
  so the wall reads as an editorial arrangement, never as rows of cards. Fewer than three columns sit centred.
  Phones and tablets: two columns, the right one starting lower (a zig-zag).
  Each project keeps a slight height of its own (WEIGHT), so no two neighbours are cut to the same size.
  Round 7 (Roman: "make it smaller"): with the cover drawings gone, every poster is about a third shorter.
*/

export type Mode = "p" | "m" | "d";
export type Box = { t: number; h: number; c: number };
export type Boxes = Record<Mode, Box>;
export type Layout = { boxes: Partial<Record<ProjectSlug, Boxes>>; height: Record<Mode, number> };

const WEIGHT: Record<ProjectSlug, number> = {
  "mega-screen": 1.07,
  wrapwerk: 0.93,
  ledbow: 1.0,
  cryptotransfer: 1.05,
  elysium: 0.94,
  "km-electronics": 1.03,
  "martin-wildt": 0.97,
};

const GAP: Record<Mode, number> = { p: 12, m: 20, d: 28 };
const CAP = 390;
const STAGGER = [-36, 0, 36];

type Placed = { slug: ProjectSlug; t: number; h: number; c: number };

/** Full rows left to right; a last row of one goes to the middle column (three columns), of two to the outer ones. */
function columns(list: Project[], k: number): Project[][] {
  const cols: Project[][] = Array.from({ length: k }, () => []);
  const full = Math.floor(list.length / k) * k;
  const tail = k === 3 ? (list.length - full === 1 ? [1] : [0, 2]) : [0];
  list.forEach((project, i) => cols[i < full ? i % k : tail[i - full]].push(project));
  return cols;
}

function desktop(list: Project[]): Placed[] {
  const k = Math.min(3, list.length);
  const gap = GAP.d;
  const cols = columns(list, k);
  const most = Math.max(...cols.map((col) => col.length));
  const average = most >= 3 ? 330 : most === 2 ? 380 : 420;
  const length = most * average + (most - 1) * gap;
  const stagger = k === 3 ? STAGGER : k === 2 ? [0, 96] : [0];
  const shift = (3 - k) / 2;
  const placed: Placed[] = [];
  cols.forEach((col, ci) => {
    const weights = col.map((project) => WEIGHT[project.slug]);
    const mean = weights.reduce((a, b) => a + b, 0) / col.length;
    const share = (length - (col.length - 1) * gap) / col.length;
    const base = col.length === most ? share : Math.min(CAP, share);
    const heights = weights.map((w) => (base * w) / mean);
    const run = heights.reduce((a, b) => a + b, 0) + (col.length - 1) * gap;
    let top = (length - run) / 2 + stagger[ci];
    col.forEach((project, i) => {
      placed.push({ slug: project.slug, t: top, h: heights[i], c: ci + shift });
      top += heights[i] + gap;
    });
  });
  return placed;
}

function twoColumns(list: Project[], mode: "p" | "m"): Placed[] {
  const k = Math.min(2, list.length);
  const gap = GAP[mode];
  const average = mode === "p" ? 210 : 320;
  const offset = mode === "p" ? 80 : 132;
  const placed: Placed[] = [];
  columns(list, k).forEach((col, ci) => {
    let top = ci === 1 ? offset : 0;
    col.forEach((project) => {
      const h = average * WEIGHT[project.slug];
      placed.push({ slug: project.slug, t: top, h, c: ci + (2 - k) / 2 });
      top += h + gap;
    });
  });
  return placed;
}

/** Tops start at 0; everything in whole pixels. */
function settle(placed: Placed[]) {
  const first = Math.min(...placed.map((box) => box.t));
  const boxes = placed.map((box) => ({ ...box, t: Math.round(box.t - first), h: Math.round(box.h) }));
  return { boxes, height: Math.max(...boxes.map((box) => box.t + box.h)) };
}

export function layoutFor(list: Project[]): Layout {
  const layout: Layout = { boxes: {}, height: { p: 0, m: 0, d: 0 } };
  if (!list.length) return layout;
  const modes: [Mode, Placed[]][] = [
    ["p", twoColumns(list, "p")],
    ["m", twoColumns(list, "m")],
    ["d", desktop(list)],
  ];
  for (const [mode, placed] of modes) {
    const { boxes, height } = settle(placed);
    layout.height[mode] = height;
    for (const box of boxes) {
      const entry = (layout.boxes[box.slug] ??= {} as Boxes);
      entry[mode] = { t: box.t, h: box.h, c: box.c };
    }
  }
  return layout;
}
