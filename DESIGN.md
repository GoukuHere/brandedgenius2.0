# v5 (2026-11-06): "black". READ THIS FIRST. It overrides the colour and material rules below.

The developer showed the 21st.dev Stipple Orb Landing in its lagoon theme, dark mode
(https://21stdev-my-components-one.vercel.app/#stipple-orb-landing/lagoon), as "super premium" for how it pairs one
brand colour with black, approved a plan and said go. Measured there: a flat #111 page, off-white #f1f1ee text, warm
greys for the quiet half of headlines, matte #1d1d1c cards with white 8% hairlines, full-width hairlines between
sections, a cream #ecebe6 main button with dark text, and the teal accent on about 1% of the screen.

The v5 rules (tokens in globals.css):
- ONE background on a black base, `--color-page` #111, carrying the thin sky lines (13%) and a faint royal light
  (PageBackground). A flat black without them was tried first; the developer asked for the background back
  (2026-11-06), so never drop these layers. Then "more darker, not that much blue shade": the light is a hint
  (0.12 at the top right, 0.04 to 0.05 elsewhere), never a navy wash.
- Text: off-white #f1f1ee (`--color-white` and `--color-ink`, so every `text-white` follows). Secondary text in the
  client's grey #969595.
- Headlines: white and blue on EVERY heading, as in the hero: the title off-white, its continuation (`accent`, the
  copy's own second phrase) in the white-to-sky gradient `.accent`, weight 400. The developer chose this over the
  reference's white and grey (2026-11-06). `Heading` always renders it; a heading needs an `accent` in site.ts (the
  same words split in two, never new words). Warum's word-by-word line takes one colour per word from the same
  gradient (a gradient clipped to moving words can vanish in Chrome).
- Sky #69BFF8 otherwise only in small doses: dots, lines, progress, active states, small icons. Never a tinted
  area or a glow behind a section. Royal lives in the logo, the hero film and the main button's edge light.
- Buttons: main = cream `bg-cream` (#ecebe6) with near-black text and a royal edge light (PrimaryLink); second =
  dark matte with a hairline and a sky light (SecondaryLink). The header uses the second style; the cream button
  leads in the content. Icon buttons fill cream on hover. 12px corners (`rounded-button`).
- Panels: `.glass` is now matte (white 3.5% fill, white 8% hairline, soft black shadow; no rim light, grain or
  tint), 16px corners (`rounded-panel`, also photos via `.frame`). Opaque stacks use #191919. A chip inside a panel
  is a step lighter (white 4.5%) with its own hairline. Only the header blurs.
- Full-width hairlines (white 7%) between the page's sections (`main > * + *`) and above the footer.
- One texture: FooterStipple at the foot of the page. Since 2026-11-06 ("make it more clean", "not animating with
  mouse hover and scroll") it is a halftone: sky dots on an even 12px grid lit by one smooth glow rising from the
  bottom centre (no random stipple, no haze). The glow rises and brightens with the scroll; on mouse and trackpad a
  soft spotlight makes the dots near the cursor swell, anywhere over the footer. It draws only while something
  changes and only on screen. No orbs anywhere (the developer's rule).
- Left out on purpose: the reference's orb, its dashboard widgets with invented numbers, its uppercase mono labels.
- Fallstudien (2026-11-06, the developer found v4's pinned sideways panels "not good at all"): after the reference's
  success stories, matte case cards in a native snap scroller, two side by side from 1280px (one with the next
  peeking below), the six areas above as navigation (cards in view marked) and arrows (beside the areas from lg,
  under the cards below). Each card leads with its three results, then headline, text, quote, what was built, and
  the tools and area at its foot (no label above the headline). No pin, no scroll hijack.
- Header: the six links show from 1280px; below that, the menu button (at 1024px the links wrapped to two lines).
- Leistungen (2026-11-06, the developer found v1's drawings "like cartoons"): four new drawings in one fine-line
  language (service-scenes.tsx): 1px hairlines that keep their screen width at every size, sky only on what moves,
  soft comets, a faint dot grid, HTML labels at 13px (from sm) using only words from each service's own text. Agents:
  process lanes into a processor chip, routed to three systems. Chatbots: three channels into a live conversation.
  Callbots: a voice waveform, caller (off-white) and AI (sky) taking turns, over the call's progress. Marketing: a
  funnel of flowing lines dropping off at four gates. Never thick outlines, icon figures or big words in boxes.
- Leistungen stack: sticky on every window at least 600px tall, phones included (the developer asked for it). A
  covered plate darkens under a shade of the page colour; never lower its opacity (the plates behind ghost through).
- Motion v6 (2026-11-07, the developer approved a top-to-bottom plan "so page looks more happening", after the
  client's "maybe little bit more animation"). One entrance language on top of every section's own piece (nothing
  that moved before was removed):
  - Every Heading: the title's words rise out of masks one after another, then the blue phrase fills left to right.
    The text and buttons beside it follow (data-reveal="up" with data-rd steps of 150ms).
  - Lists rise one after another (data-reveal-group); photos open from their bottom edge and settle
    (data-reveal="photo"); hairlines draw (data-reveal="rule" / "rule-y"); the contact checks tick in.
  - The hairline between sections draws out from the centre. The hero's blue phrase gets one light sweep.
  - Ablauf photos drift slightly slower than the page (CSS scroll timelines; browsers without them stay still).
  - Desktop mouse: every glass panel catches a soft light and a sky edge under the pointer (MagicCard panels keep
    their own). The header lights the link of the section being read, with a sliding sky dot.
  - Warum's team photo (the developer: "seems smaller at start and as we scroll ... becomes larger smoothly"): the
    pinned expansion from a small frame to full screen now runs on every window at least 560px tall (desktops
    needed 720px, which most laptop windows with display scaling are not). Shorter windows get a lighter version:
    the stacked photo grows from 80% to full size as it comes up the screen.
  - Smooth scrolling (the developer asked for it; Lenis 1.3.27 in system/smooth-scroll.tsx): the wheel and the
    trackpad glide (lerp 0.065, wheel steps at 65%: the developer found Lenis's defaults "way too fast"), touch
    keeps the phone's own scrolling, in-page links glide and still land on the page's scroll
    padding and scroll margins, it pauses while the phone menu or the video player holds the page, sideways swipes
    over the Fallstudien cards stay native (data-lenis-prevent-horizontal), and reduced motion gets no Lenis. v1
    dropped Lenis after the client found the page slow, so keep it this light.
  - One trigger (RevealObserver, once per element) and CSS only: opacity, translate, scale, clip-path and
    background positions. Never `transform` in these keyframes (Motion owns it on many elements), never a fill
    that outlives the entrance, never a hidden state without script (`@media (scripting: enabled)`) or with
    reduced motion. Figures never count up; the background stays still (the client allowed one animated
    background, the footer glow).
- Photos (2026-11-06, the developer: "All the images already used are all AI ... currently all images are in low
  quality"; the client asked for "better stunning pics"). Every photo without Roman is a real Pexels photo (free for
  commercial use, no credit required), downloaded at its original size and resized with lanczos: Realitaet and
  Workshops 2000px wide, Ablauf 1800px, WebP quality 86. next/image serves them at quality 85
  (`images.qualities` [75, 85]): the dark scenes band at the default 75. Every photo with Roman is the client's own
  original at its full size (team 2400px, training 1800px, workshops and desk 1600px), never a smaller copy. On the
  two workshop photos the AI's garbled slide lettering is softened like an out-of-focus background. Picks: low-key
  real scenes for the problems (Realitaet), natural rooms for Ablauf and Workshops; no logos, no readable foreign
  text, no stock clichés (shrugs, thumbs up, hacker hoodies). No grade on top: each photo keeps its own light.
  Pexels ids: reality roadmap 6814533, tool-chaos 11404176, manuell 36713389, unsicher 7731379, datenschutz
  37730211, kpis 18706593; process analyse 36766694, filtern 30535639, roadmap 39205088, pilot 6804071,
  implementierung 16129724, skalierung 12969403; workshop online 7643888, individuell 5324985. New file names on
  purpose, so no cache can serve an old photo. Roman's photos can be regenerated with Gemini (the developer's
  Antigravity CLI keeps his face), but its output stops near 1 megapixel, below the client's originals.

# v4 (2026-11-06): It overrides the v3 brief below for the nine sections being redone.

## Why v4
The developer marked nine v3 sections as "cheap": Problem, Die Realität, Vorher/Nachher, Versprechen, Lösung,
System, Fallstudien, Warum and the Workshop topics. They want them redone completely: new, premium, animated,
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
- Buttons (2026-11-06, the developer's reference): slightly curved corners, no pill or round buttons anywhere.
  One radius for every button, icon button and button-like badge: `rounded-button` (12px, `--radius-button` in
  globals.css; `BUTTON_RADIUS` in primitives.tsx feeds SpecularButton's edge light). 10px for the small nav
  highlight and the skip link. A bar or panel that holds a button keeps its corner concentric: the header bar is
  20px (the 12px button plus its 8px inset). Dots, rings and progress lines stay round.
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
- `AnimatedBackground` (Motion Primitives, controlled via `value`): no longer used (v4 replaced the Realität highlight and the Fallstudien tab pill).
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

## Layout concepts for the next round (2026-11-07)
The client found the live page "too standard, like my previous page, only the background changed" and asked for two completely different layout designs with more gradient colour, not a full homepage. Each concept is the hero plus three parts (Problem, Leistungen, Fallstudien) and a closing call to action, built only from the client's copy in `site.ts` (cut down, never invented). Both live outside the homepage, at `/v2` and `/v3` (noindex; first at /konzept-1 and /konzept-2, which redirect), with their own code in `src/components/concepts/` and their own stylesheet (`concepts.css`, imported only by those two routes).
- Shared: the brand blues as deep gradients with film grain; new buttons (`ConceptLink`: royal fill with a sky rim and a passing light, a quiet outline, and a comet edge for concept 2), 12px corners as everywhere.
- Konzept 1, Kapitel (`chapters/chapters.tsx`): full-screen chapters that pin, step through their content on scroll, then shrink back and darken while the next chapter slides up over them. A chapter bar at the foot shows where you are. Each chapter has its own light. Scroll distances are fixed pixels; only the panels themselves fill the screen (the concept is full-screen by design).
- Konzept 2, Der blaue Faden (`thread/thread.tsx`): one continuous canvas, no boxes. A thread of light, built from measured anchors (`data-thread`), loops round the film, passes the claim, tangles into a knot beside the problems, becomes rails under the four services, rises as the results line and ends at the main button. It draws itself following a reading line two thirds down the screen. Phones: the thread runs down a left gutter.
- Konzept 3, Papier (`paper/paper.tsx`), after the developer asked for two more concepts with "totally new colours and everything" (the first two still felt like the dark earlier versions): the page turns light. Warm paper (#f3efe6), ink type (#0f1a2b), the brand's royal as a solid accent and one deep royal band. Newsreader (upright serif, via next/font) for headlines, General Sans for reading. A magazine cover with the film as a wide plate, sticky splits (the headline column stays while the content scrolls beside it), the services as an index whose drawing follows the cursor, the case results as a ledger. Buttons: solid ink turning royal, underlined text links. The wordmark is shown in ink with a CSS filter.
- Konzept 4, Kobalt (`cobalt/cobalt.tsx`): one vivid cobalt gradient behind the whole page and every part as a mosaic of tiles (paper white, ice, ink, the brand gradient, photos) that assemble as they come into view and lean towards the pointer. Instrument Sans (via next/font), condensed and bold for headlines. Buttons: ink on light tiles, white on blue.
- The service drawings render only in the browser in the concepts (`ClientScene`): server and browser round their floating-point coordinates differently, which React reports as a hydration mismatch.
- Konzept 5, Warp (`warp/warp.tsx`, `warp/fx.tsx`), after the developer asked for two more "super futuristic and animated" concepts with "100% new design and flow", and web research (this year's award winners move a camera through one space instead of stacking sections). One fixed stage seen through a 1100px perspective; the page's scroll drives a flight forward through a tunnel of light frames, and each part of the page is a station that comes out of the distance, holds while it is read (DWELL px), and passes the camera (FLIGHT px between stations). The tunnel also drifts forward on its own. Elements: headlines filled with liquid chrome (`ChromeText`: the real text stays in the page; a WebGL shader draws the words through a mask built from the browser's own layout), LED dot-matrix displays (`DotMatrix`, re-lighting dot by dot on change) for the claim, the service names and the case results, the film as a tilted holographic screen with scan lines, a curved wall of problem panels, chrome buttons with a glint, a station gauge. Unbounded, Geist and Geist Mono via next/font. Reduced motion: the stations stand one under the other.
- Konzept 6, System (`system/system.tsx`): the page is one large plan (light silver with a blueprint grid) that the camera flies over: the Branded Genius core in the middle, the client's tools wired to it (SYSTEM.nodes), and one room per part of the page. The camera starts in the first room, pulls back to the whole system (with SYSTEM's own title and claim), then flies room to room, zooming out mid-flight. Signals pulse along the wires, the core breathes, the problem room scans its findings in, the case results are read off by a light, a minimap (desktop) shows the view and flies anywhere. Phones get the same flight over a single column. Sora and Geist Mono via next/font. Reduced motion: the rooms stand one under the other.
- WebGL in development: React runs each effect twice in development, so an effect must never destroy its WebGL context in cleanup (the second run would draw on a dead context); stop the loop instead.
- Versions (2026-11-07, the developer: "list all versions in nav as v1, v2 and so on"): v1 is the homepage, v2 to v7 are the six concepts in the order they were made (v2 Kapitel, v3 Der blaue Faden, v4 Papier, v5 Kobalt, v6 Warp, v7 System), at /v2 to /v7. `VersionNav` (system/version-nav.tsx, in the root layout) floats at the bottom left of every page: all versions in a row on a desktop, one button that opens the list on a phone. The old /konzept-N addresses and /v1 redirect (next.config.ts).
