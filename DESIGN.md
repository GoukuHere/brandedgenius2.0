# v4 (2026-11-06): READ THIS FIRST. It overrides the v3 brief below for the nine sections being redone.

## Why v4
The developer marked nine v3 sections as "cheap": Problem, Die Realität, Vorher/Nachher, Versprechen, Lösung,
System, Fallstudien, Warum and the Workshop topics. He wants them redone completely: new, premium, animated,
stunning, and not looking like v1, v2 or v3. They must be visibly built from Magic UI, 21st.dev and Motion
Primitives. Inspiration (not to copy): https://ave-engineers.vercel.app/. Its lessons:
- One big object per screen, with generous black space; never a wall of equal boxes.
- A short continuation phrase in a heading set as an OUTLINE instead of a fill.
- Large OUTLINED numbers as real numbering.
- Thin accent lines with dots as connective tissue, branching like a circuit.
- Pinned scroll stories: one object that turns in 3D while statements step beside it, with step ticks.
- Wide case panels that move horizontally.
Kept untouched: the hero, the Leistungen stack, the Ablauf timeline, Business Impact, Partners, the Kundenstimmen
arc, the CTA and the footer.

## Rules that still bind (from the client and the developer)
- ONE background (PageBackground). No section backgrounds, light pools, shaders, canvases or particles.
- Brand colours only: royal #004BA0, sky #69BFF8, ice #dcecff, grey #969595, white, ink, page #040a13.
- Content clearly visible. NO text over photos. Body text at least 4.5:1.
- Effects in moderation; performance matters (integrated graphics). Animate transform, opacity, clip-path and
  SVG stroke only. No animated blur on large elements, no backdrop-filter in your sections.
- The client liked: the fly-in problem cards, the service line animations, the original timeline, and
  testimonials with arrows.
- Developer: General Sans only, no italics, no monospace, no uppercase micro labels, NO EYEBROWS (nothing small
  above a headline), no sparkles, orbs, glows as decoration, purple gradients, count-up numbers, icons in tinted
  squares, or identical card grids. No dummy or invented copy: German text verbatim from src/content/site.ts
  (never add sentences, labels or numbers that are not there). Display type at most 60px; section h2 48-56px.
- Every infinite loop pauses off screen. Never branch rendered markup on useReducedMotion, window or matchMedia
  during render (hydration). Reduced motion shows the final, readable state.

## v4 devices (shared, already in globals.css and primitives.tsx)
- `Heading variant="outline"` sets the accent as `.outline-text` (stroked, transparent fill). Use it only when the
  accent is short (about 5 words or fewer) and the heading is 40px or larger.
- `.ghost-num`: large outlined sky numbers (64-160px), used as the item's real number.
- Lines and dots: 1px sky lines (opacity 0.35-0.6) and 6-8px sky dots (filled = connected, ring = open).
- Glass (`.glass`, `.glass-lit`) for focal objects. The 20-surface budget is lifted for the v4 sections, but use
  glass only where the spec says so.
- Components in src/components/ui: MagicCard and BorderBeam (Magic UI); AnimatedBeam (21st.dev/Magic UI);
  TextEffect, TextLoop, Tilt, InView, Accordion, AnimatedBackground, TransitionPanel and MorphingDialog (Motion
  Primitives); (Vorher/Nachher is a hand-built "chaos to system" panel in the site's line-and-dot language.)
- Pinned scroll stages only where the spec says so, only on lg screens at least 720px tall
  (`lg:[@media(min-height:720px)]:...` in CSS). Phones and short screens get a simple stacked version with all
  content visible.

---

# Branded Genius v3: design brief for every section

Read this whole file before writing code. It is the contract that keeps the page coherent.

## Why v3 exists
The client (Roman Tränkle, Branded Genius, an AI-automation agency in Pforzheim) rejected v1. The developer rejected v2 as "cheap" and "AI generated": every section had the same skeleton (left heading, paragraph, grid of thin cards with small icons in tinted squares), two-tone headings everywhere, and invented content that is not on the client's site. v3 is **dark, glass and effects**, built from Magic UI, 21st.dev and Motion Primitives components, and it follows the client's ORIGINAL homepage content and order exactly (see `src/content/site.ts`).

## The client's standing instructions (binding)
- ONE consistent background on the whole page (`PageBackground`, fixed, static). Never give a section its own background colour, image, gradient band, light pool, shader or canvas.
- Brand colours only: Royal `#004BA0` (`royal`), bright royal `#1a6fe0` (`royal-bright`, gradients only), Sky `#69BFF8` (`sky`), ice `#dcecff` (`ice`), grey `#969595` (`silver`), white, ink `#eaf1fa` (`ink`), the page `#040a13` (`page`). No red, orange, green, purple, teal, yellow (also not in components' defaults: override every colour prop).
- Content clearly visible: no text over photos, no photos behind text.
- Effects in moderation; performance matters (the client and the developer both use integrated graphics).

## The developer's standing rules (binding)
- One typeface: General Sans (the page default). **No italics anywhere.** No monospace. No uppercase micro-labels with wide tracking.
- **No eyebrows**: nothing small above a headline (no kicker, no "01 / Section", no badge, no pill). A number may sit inline before a title on the same line.
- No sparkles, particles, decorative orbs or concentric circles, purple-blue gradients, stat counters that count up, emoji icons, fake badges, status dots.
- Every element does real work: no dummy links, no invented copy, no invented numbers or charts.
- Copy comes ONLY from `src/content/site.ts`, verbatim, German. Never invent, translate or embellish. If something is missing there, do not make it up; report it.

## The v3 glass system (globals.css), reviewed
- ONE material, lit from above. GLASS BUDGET: fewer than 20 glass surfaces on the whole page, only where your spec says. Never glass inside glass. No glass on headings, text blocks, list items, chips, icons, photos, buttons, the partner strip or the footer.
- `.glass`: the sheet (top-lit rim, faint ice fill, grey grain, black shadow). Radius 28px default; inner radius = outer minus padding.
- `.glass-lit`: add to the ONE featured glass object of a section (sky-tinted top edge).
- `.glass-blur`: backdrop blur. ONLY the header and the Fallstudien case panel. A blurred element must have no ancestor with an opacity animation, filter, mask, clip-path or blend mode (no Reveal around it; animate the element itself).
- `.frame`: photos. Hairline frame + 24px radius, no glass. Photos are already colour-graded into one look.
- `.rule`: 1px hairline between editorial items.
- NO light pools anywhere (all light lives in the fixed PageBackground).
- Default composition is EDITORIAL: type on the one background, hairlines between items, asymmetric spreads, one focal object per section. A card only where the object moves or is touched.
- Typography classes: `.t-display .t-h2 .t-h3 .t-lead .t-body .t-small .accent .num .tone`. Headings LEFT aligned, solid white (`Heading` default). `.accent` (white-to-sky) only in the hero and CTA (`variant="gradient"`).

## Components (src/components/ui, adapted; use each only where your spec says)
- `MagicCard` (Magic UI): cursor-lit edge; only on the front Leistungen plate.
- `BorderBeam` (Magic UI): only on the CTA panel (pauses off screen, hidden for reduced motion).
- `AnimatedBeam` (21st.dev Animated Beam Integration core): System routes only.
- `Marquee` (Magic UI): partner logos only (pauses off screen).
- `TextEffect` (Motion Primitives, forked to play once in view): only the Warum punchline.
- `AnimatedBackground` (Motion Primitives, controlled via `value`): the Realität hover highlight and the Fallstudien tab pill.
- `TransitionPanel` (Motion Primitives): Fallstudien case switch.
- `Accordion` (Motion Primitives): Die Realität rows.
- `MorphingDialog` (Motion Primitives): testimonial video player.
- Shared primitives in `src/components/system`: `Section`, `Container`, `Heading`, `PrimaryLink`, `SecondaryLink`, `TextLink` (primitives.tsx); `Reveal`, `RevealGroup`, `RevealItem` (reveal.tsx); `useSectionProgress` (scroll progress honouring offsets).
- ONE motion style: scroll-linked and reversible (useSectionProgress + useTransform on transform/opacity) for content, 600 to 900ms ease-out-expo for one-off entrances, 150 to 250ms hovers. Big moments only in Problem (fly-in), System (route), Leistungen (stack) and Ablauf (beam). Other sections: one block fade or nothing.
- Icons: lucide-react, strokeWidth 1.5, bare (never in a container); only where they carry meaning.

## Layout and rhythm
- Container: `Container` (max-w 1280, px-5/md:px-8). Sections `py-16 md:py-24` (2026-11-06: tightened; about 200px between sections on desktop).
- Each section has ONE signature composition from its spec; never reuse another section's layout. Alternate alignment: some headers centred, some left, as the spec says.
- Generous space, few large elements. Large glass panels (radius 28 to 36px) rather than many small cards.
- Mobile first: must work at 360 to 375px wide (no horizontal overflow, 44px touch targets, 16px minimum body text). Desktop reference 1659x900.

## Motion and performance
- Animate only transform and opacity (and SVG stroke where specified). No animated blur on large elements.
- Every infinite loop pauses or unmounts off screen (BorderBeam and AnimatedBeam already do).
- Reduced motion: `MotionProvider` (MotionConfig reducedMotion="user") handles motion components. NEVER render different markup based on `useReducedMotion()` (it breaks hydration); use CSS `motion-reduce:` or effects instead.
- Images: `next/image` with real `sizes`, inside a `.frame` (its hairline is drawn above the photo by `.frame::after`). Never text over an image.

## File ownership and verification
- Create only the files named in your task under `src/components/sections/` (and, if your task says so, a private helper file next to it). Export exactly the component name given. Do not edit shared files (`globals.css`, `primitives.tsx`, `reveal.tsx`, `site.ts`, `page.tsx`, `layout.tsx`, anything in `components/ui`). If you need a shared change, say so in your final report.
- Verify with `npx tsc --noEmit -p .` (only your files must be error-free; others are being written in parallel) and `npx eslint <your files>`. Do NOT run `next build`, `next dev`, `npm install`, the shadcn CLI, or any browser.
- Final report: exports, section ids, client-side behaviour, anything the integrator must know.
