/*
  The site's two languages (round 5, the client's message of 2026-11-18: "add a switch button to English and German
  in the top of the navigation but the website should start always in German").

  German is the site: its pages keep their addresses (/, /leistungen, ...). English lives under /en with English
  addresses (/en/services, ...). Both are rendered from the same pages in app/[lang]; next.config.ts rewrites the
  public addresses onto them (German onto /de/..., the English slugs onto the German folder names) and redirects
  /de/... back to the plain address, so every page has one address per language. Nothing reads the browser's
  language: a visit always opens in German, and only the switch leads to English.
*/

export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";
export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** The site's pages, by a stable key, with their public address in each language. */
export const PAGES = {
  home: { de: "/", en: "/en" },
  leistungen: { de: "/leistungen", en: "/en/services" },
  useCases: { de: "/use-cases", en: "/en/use-cases" },
  kiWorkshop: { de: "/ki-workshop", en: "/en/ai-workshop" },
  uberUns: { de: "/uber-uns", en: "/en/about" },
  kontakt: { de: "/kontakt", en: "/en/contact" },
} as const satisfies Record<string, Record<Locale, string>>;
export type PageKey = keyof typeof PAGES;

/**
 * A page's public address in a language, with an optional #section. 2026-11-24: with the trailing slash every address
 * on the site has (the client's WordPress addresses all had one; next.config.ts trailingSlash), so a link never
 * passes through a redirect. PAGES itself stays without it, for matching.
 */
export function pathFor(locale: Locale, page: PageKey, hash?: string) {
  const path = PAGES[page][locale];
  return (path === "/" ? path : `${path}/`) + (hash ? `#${hash}` : "");
}

/*
  The public address for an address as the router may report it. The pages are rendered at their internal routes
  (/de/leistungen, /en/leistungen, see next.config.ts), and while a page is prerendered usePathname() gives that
  internal route, in the browser the public one (/leistungen, /en/services). Anything that renders from the address
  maps it here first, so the server's and the browser's HTML agree.
*/
const EN_FOLDERS: Partial<Record<string, PageKey>> = { leistungen: "leistungen", "ki-workshop": "kiWorkshop", "uber-uns": "uberUns", kontakt: "kontakt" };
export function publicPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/de") return "/";
  if (path.startsWith("/de/")) return path.slice(3);
  const en = path.match(/^\/en\/([^/]+)(\/.*)?$/);
  const page = en ? EN_FOLDERS[en[1]] : undefined;
  if (en && page) return PAGES[page].en + (en[2] ?? "");
  return path;
}

/** Which page an address belongs to (its own address, or a deeper one under it), and in which language. */
export function pageOf(pathname: string): { page: PageKey; locale: Locale } | null {
  const path = publicPath(pathname);
  for (const locale of LOCALES) {
    // Longest addresses first, so "/en" (home) never claims "/en/services".
    const entries = (Object.entries(PAGES) as [PageKey, Record<Locale, string>][]).sort((a, b) => b[1][locale].length - a[1][locale].length);
    for (const [page, paths] of entries) {
      const own = paths[locale];
      if (own === "/" ? path === "/" : path === own || path.startsWith(`${own}/`)) return { page, locale };
    }
  }
  return null;
}

/** The same page in the other language (the home page when the address is not one of the site's pages). */
export function switchPath(pathname: string, to: Locale) {
  const hit = pageOf(pathname);
  return pathFor(to, hit ? hit.page : "home");
}
