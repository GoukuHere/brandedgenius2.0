import type { Metadata } from "next";
import { PAGES, type Locale, type PageKey } from "@/i18n/config";

/*
  Search (2026-11-24, the move from the client's WordPress site): the client "didn't want to lose the SEO", so the new
  site answers at the old addresses (every one ends in a slash, as WordPress served them), keeps each old page's title
  and description word for word on the day of the move, and points every canonical, language pair, sitemap entry and
  structured-data address at the live domain. On vercel.app the same pages are kept out of search by a header
  (next.config.ts), so only brandedgenius.de is indexed.
*/

/** The live domain: canonicals, the sitemap and the structured data point here. */
export const SITE_URL = "https://brandedgenius.de";
export const SITE_NAME = "Branded Genius";

/** An address as the site serves it: with the trailing slash the old WordPress addresses all had. */
export const slashed = (path: string) => (path.endsWith("/") ? path : `${path}/`);
export const absolute = (path: string) => SITE_URL + slashed(path);

/** The old site's robots line (Rank Math), kept: indexable, large previews allowed. */
export const ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  "max-snippet": -1,
  "max-image-preview": "large",
  "max-video-preview": -1,
};

/** The share card for pages without their own picture (public/og-image.jpg: the hero film's still with the logo). */
export const SHARE_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "Branded Genius" };

/** A title as the browser tab and the results show it: one brand, never twice. */
export const fullTitle = (title: string) => (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

/**
  One of the six pages in both languages: its own title and description, its canonical, the language pair (x-default
  is German, the site's first language) and the share card.
*/
export function pageMetadata(page: PageKey, locale: Locale, meta: { title: string; description: string }): Metadata {
  const title = fullTitle(meta.title);
  const path = slashed(PAGES[page][locale]);
  return {
    title: { absolute: title },
    description: meta.description,
    alternates: {
      canonical: path,
      languages: { de: slashed(PAGES[page].de), en: slashed(PAGES[page].en), "x-default": slashed(PAGES[page].de) },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      title,
      description: meta.description,
      locale: locale === "de" ? "de_DE" : "en_US",
      alternateLocale: locale === "de" ? ["en_US"] : ["de_DE"],
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description: meta.description, images: [SHARE_IMAGE.url] },
  };
}

/**
  A German-only page (the blog, the glossary, a post, the legal pages): its old title exactly as the old site served
  it (most carry the old site's tagline, not the brand; changing them is for a few weeks after the move), its old
  description, no language pair.
*/
export function germanMetadata(path: string, meta: { title: string; description: string; image?: { src: string; width: number | null; height: number | null; alt: string } | null; type?: "website" | "article"; published?: string; modified?: string }): Metadata {
  const title = meta.title;
  const image = meta.image ? { url: meta.image.src, width: meta.image.width ?? undefined, height: meta.image.height ?? undefined, alt: meta.image.alt || title } : SHARE_IMAGE;
  return {
    title: { absolute: title },
    description: meta.description,
    alternates: { canonical: slashed(path) },
    openGraph: {
      type: meta.type ?? "website",
      url: slashed(path),
      siteName: SITE_NAME,
      title,
      description: meta.description,
      locale: "de_DE",
      images: [image],
      ...(meta.type === "article" ? { publishedTime: meta.published, modifiedTime: meta.modified, authors: ["Roman Tränkle"] } : {}),
    },
    twitter: { card: "summary_large_image", title, description: meta.description, images: [image.url] },
  };
}

/* ---------- Structured data (JSON-LD) ---------- */

const ORG_ID = `${SITE_URL}/#organization`;
const PERSON_ID = `${SITE_URL}/#roman`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
  The business, its founder and the website, on every page. Every fact is the client's own, from the Impressum: the
  name, the address in Pforzheim, the e-mail and the phone number. (The old site named the organisation after its
  WordPress tagline and gave the language as en-US; both corrected.)
*/
export function siteGraph(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/brand/logo.svg`,
        image: `${SITE_URL}${SHARE_IMAGE.url}`,
        email: "info@brandedgenius.de",
        telephone: "+49 176 24624981",
        address: { "@type": "PostalAddress", streetAddress: "Luisenstr. 65", postalCode: "75172", addressLocality: "Pforzheim", addressCountry: "DE" },
        founder: { "@id": PERSON_ID },
        areaServed: "DE",
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Roman Tränkle",
        worksFor: { "@id": ORG_ID },
        url: `${SITE_URL}/uber-uns/`,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        publisher: { "@id": ORG_ID },
        inLanguage: locale === "de" ? "de-DE" : "en",
      },
    ],
  };
}

/** A post: the article itself and its trail (home, its list, the post), as the old site described it (BlogPosting). */
export function postGraph(post: { path: string; title: string; description: string | null; date: string; modified: string; image: { src: string } | null }, list: { name: string; path: string }) {
  const url = absolute(post.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description ?? undefined,
        datePublished: post.date,
        dateModified: post.modified,
        author: { "@id": PERSON_ID, name: "Roman Tränkle" },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: url,
        image: post.image ? `${SITE_URL}${post.image.src}` : `${SITE_URL}${SHARE_IMAGE.url}`,
        inLanguage: "de-DE",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: list.name, item: absolute(list.path) },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}

/** The JSON for a <script type="application/ld+json">, with "<" escaped so no text can close the tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
