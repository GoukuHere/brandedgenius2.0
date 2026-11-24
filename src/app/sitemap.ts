import type { MetadataRoute } from "next";
import { BLOG, LEGAL, LISTS, WIKI } from "@/content/wp";
import { LOCALES, PAGES, type PageKey } from "@/i18n/config";
import { absolute } from "@/lib/seo";

/*
  /sitemap.xml (2026-11-24): every page the site serves, at the live domain. The six pages in both languages with
  their language pairs; the blog and glossary lists, the legal pages and the 141 posts in German with the dates
  their content last changed (the posts' own WordPress dates). The old sitemaps (sitemap_index.xml and its parts)
  redirect here.
*/

/** The day the six pages' current content went live. */
const PAGES_UPDATED = "2026-11-24";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = (Object.keys(PAGES) as PageKey[]).flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absolute(PAGES[page][locale]),
      lastModified: PAGES_UPDATED,
      alternates: { languages: { de: absolute(PAGES[page].de), en: absolute(PAGES[page].en), "x-default": absolute(PAGES[page].de) } },
    }))
  );
  const latest = (dates: string[]) => dates.reduce((a, b) => (a > b ? a : b));
  const lists = [
    { url: absolute(LISTS.blog.path), lastModified: latest([LISTS.blog.modified, ...BLOG.map((p) => p.modified)]) },
    { url: absolute(LISTS.wikipedia.path), lastModified: latest([LISTS.wikipedia.modified, ...WIKI.map((p) => p.modified)]) },
  ];
  const legal = Object.values(LEGAL).map((page) => ({ url: absolute(page.path), lastModified: page.modified }));
  const posts = [...BLOG, ...WIKI].map((post) => ({ url: absolute(post.path), lastModified: post.modified }));
  return [...pages, ...lists, ...legal, ...posts];
}
