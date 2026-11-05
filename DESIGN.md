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
- Container: `Container` (max-w 1280, px-5/md:px-8). Sections `py-24 md:py-36`.
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
