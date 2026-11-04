# Branded Genius v2: design brief for every section

Read this whole file before writing code. It is the contract that keeps the page coherent.

## Why v2 exists
The client (Roman Tränkle, Branded Genius, an AI-automation agency in Pforzheim) rejected every section of v1. Their review:
- Too many different things and too many different backgrounds. Wants ONE consistent background for the whole page, like https://arventas.de/ (deep navy, a soft glow, faint thin lines). That background already exists: `src/components/system/page-background.tsx`, fixed behind the page. **Never give a section its own background colour, image, gradient band, shader or canvas.**
- Animated backgrounds hurt performance. No ambient background animation anywhere.
- Colours must follow the brand guide. "We don't use this kind of colours." No red, orange, green, purple, teal, or bright light-blue tints.
- Content must be clearly visible. No photos behind text, no text over busy images.
- The client liked: the headline font with the serif gradient accent, the fly-in animation of the problem cards, the small looping line drawings (the phone for callbots) if more visible, the scrolling service-word marquee, and the ORIGINAL brandedgenius.de process timeline (optimise it, "like a better timeline").
- Testimonials need arrows. CTA and footer had off-brand colours.

Quality bar: arventas.de (calm, premium, one background, generous space, big confident headlines) and jamescannella.com (craft). Premium comes from restraint, spacing, type and a few well-made motions, not from effects.

## Hard rules
1. **Colours**: only these. Page navy `bg-page` (#050a14), surfaces via `.surface`, Royal `#004BA0` (`royal`), bright royal `#1a6fe0` (`royal-bright`, only inside gradients), Sky `#69BFF8` (`sky`), ice `#dcecff` (`ice`), brand grey `#969595` (`silver`), white, `ink` (#eaf1fa) for text. Opacity variants (`white/10`, `sky/20`) are fine.
2. **Fonts**: ONE face, General Sans (variable, 200 to 700, self-hosted from `src/app/fonts`), upright only. **No italics anywhere** (no `italic` class, no `font-style: italic`, no italic files) and no second typeface. Headlines are two-tone through `Heading` (title in white weight 500, continuation in `.tone`). The white-to-sky gradient `.accent` (same face, weight 400) appears ONLY in the hero and the closing contact section (`Heading serif`; the prop name is historical). Big figures and step numbers use `.num` (weight 300, lining tabular figures). No monospace. No all-caps labels with wide tracking. Sizes: display max 60px, h2 max 48px; tracking -0.03em display, -0.025em h2.
3. **No eyebrows**: never put a small label, kicker, "01 / Section", or category tag above a headline. A number may sit inline before a title (e.g. a serif "01" on the same line).
4. **Banned AI tells**: decorative orbs/blobs/spheres, purple-to-blue gradients, sparkles, particle or dot backgrounds, concentric circles, glassmorphism with backdrop blur, auto-incrementing counters, identical icon-card grids without purpose, emoji icons, fake badges, status dots, elements that do no real work.
5. **No backdrop-filter** in sections (it costs frames on the client's integrated graphics). No animated `filter`/`blur`. Animate only `transform` and `opacity` (and SVG stroke-dashoffset where specified).
6. **Copy** comes only from `src/content/site.ts`, in German, verbatim. Never invent, translate or embellish copy. If a line you need is missing, use only what is there.
7. **Images**: `next/image` with a real `sizes` attribute, `rounded-[24px]`, and a soft bottom shade (`bg-gradient-to-t from-page/50 to-transparent`) when text sits near them. Never place text over a photo.

## Shared building blocks (import, do not re-create)
- `@/components/system/primitives`: `Section` (`py-24 md:py-32` section wrapper with id), `Container` (max-w 1280, px-5/md:px-8), `Heading` (`title` + `accent`, sizes display/h2/h3), `PrimaryLink` (brand-blue gradient pill; external links open in a new tab automatically), `SecondaryLink` (outline pill), `TextLink` (sky text link with arrow), `IconChip` (sky icon holder; pass a lucide icon).
- `@/components/system/reveal`: `Reveal` (rise and fade once on view), `RevealGroup` + `RevealItem` (staggered lists).
- `@/components/system/use-section-progress`: `useSectionProgress(ref, offset)` for scroll-linked motion (JS-driven, respects offsets).
- CSS classes in `src/app/globals.css`: `.t-display .t-h2 .t-h3 .t-lead .t-body .t-small .accent .num .surface .surface-hover .hairline`.
- Icons: `lucide-react`, `strokeWidth={1.5}`, inside `IconChip` or at size-4/5 inline.
- Content and links: `@/content/site` (`LINKS`, `MEDIA`, and one export per section).
- `cn` from `@/lib/utils`.

## Layout conventions
- Section header: left aligned, `Heading` (h2) with `max-w-[820px]`, then `.t-lead` paragraph `mt-6 max-w-[620px]`. Header block wrapped in `Reveal`. Content starts `mt-14 md:mt-20` below it.
- Grid gaps `gap-5 md:gap-6`; card padding `p-6 md:p-8`; radius 24px (cards), 28-32px (large panels), full (pills).
- Asymmetric, editorial compositions beat centred stacks. Generous whitespace.
- Mobile first: everything must work at 375px wide (no horizontal overflow, touch targets at least 44px, 16px minimum body text). Desktop reference width 1659px.

## Motion conventions
- Default entrance: `Reveal` / `RevealGroup`. Durations 0.6-0.9s, ease `[0.16, 1, 0.3, 1]`. Micro-interactions 200-300ms.
- Only the section that owns a signature motion (named in its spec) may add more. Loops must pause when off screen (IntersectionObserver) and stop for `useReducedMotion()`.
- Hover states: border to `sky/30`, slight lift (`-translate-y-0.5`), arrow nudge. No scale on text.

## File ownership and verification
- Create only the files named in your task, under `src/components/sections/`. Export exactly the component name given. Do not edit shared files (`globals.css`, `primitives.tsx`, `reveal.tsx`, `site.ts`, `page.tsx`, `layout.tsx`); if you need a shared change, say so in your final report.
- Client components need `"use client"` only when they use hooks or events.
- Verify with `npx tsc --noEmit -p .` (ignore errors in files you do not own; other agents are writing in parallel) and `npx eslint <your files>`. Do NOT run `next build`, `next dev`, `npm install`, or any browser: other agents share this machine.
- In your final report: exports, section ids, client-side behaviour, anything the integrator must know.
