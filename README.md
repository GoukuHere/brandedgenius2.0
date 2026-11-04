# Branded Genius, homepage v2

A redesign of the brandedgenius.de homepage, built after the client's review of v1.

- One background for the whole page (deep navy, a soft royal glow, faint lines), after the client's reference arventas.de.
- Brand colours only: Royal #004BA0, Sky #69BFF8, grey #969595, on navy.
- One typeface, General Sans by Indian Type Foundry (Fontshare), upright only. The white-to-sky gradient phrase appears only in the hero and the closing contact section.
- Font licence: ITF Free Font License 2.0 (`src/app/fonts/GeneralSans-FFL.txt`), free for commercial use and self-hosting. The licence asks every user to get their own copy, so for the client's production site Branded Genius should download General Sans from fontshare.com themselves (free) and keep it in this folder.
- All copy is the client's own, from brandedgenius.de, in `src/content/site.ts`. Media in `public/media` is the client's own (hero film, company film, photos).

Stack: Next.js 16, React 19, Tailwind CSS 4, Motion. Design rules for every section: `DESIGN.md`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Deploy: Vercel, framework preset Next.js (`vercel.json` pins it).
