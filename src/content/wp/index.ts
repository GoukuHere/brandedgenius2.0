import PAGES_DATA from "./pages.json";
import POSTS_DATA from "./posts.json";

/*
  The client's WordPress content, brought over on 2026-11-24 so the new site answers at every old address
  (brandedgenius.de/uncategorized/<slug>/ and /wikipedia/<slug>/, the blog and glossary lists, the legal pages).
  posts.json and pages.json were written from the WordPress export: each post's text as clean HTML (headings,
  paragraphs, lists, tables, links, images at their old /wp-content/uploads/ paths), and the title, description and H1
  each address served, kept word for word for the day of the move. Server components only (the posts are about 1 MB).
*/

export type WpImage = { src: string; alt: string; width: number | null; height: number | null };
export type WpPost = {
  id: number;
  cat: "uncategorized" | "wikipedia";
  slug: string;
  path: string;
  title: string;
  seoTitle: string | null;
  description: string | null;
  h1: string;
  date: string;
  modified: string;
  excerpt: string;
  image: WpImage | null;
  words: number;
  html: string;
};
export type WpLegal = { path: string; seoTitle: string; description: string; h1: string; lead: string[]; modified: string; words: number; html: string };
export type WpList = { path: string; seoTitle: string; description: string; h1: string; intro: string; modified: string };

export const POSTS = POSTS_DATA as WpPost[];
const P = PAGES_DATA as unknown as Record<"impressum" | "datenschutzerklarung" | "agb", WpLegal> & Record<"blog" | "wikipedia", WpList>;
export const LEGAL = { impressum: P.impressum, datenschutzerklarung: P.datenschutzerklarung, agb: P.agb };
export type LegalKey = keyof typeof LEGAL;
export const LISTS = { blog: P.blog, wikipedia: P.wikipedia };

/** The blog's articles, newest first (the old site listed them the same way). */
export const BLOG = POSTS.filter((p) => p.cat === "uncategorized").sort((a, b) => b.date.localeCompare(a.date));
/** The glossary, A to Z by title. */
export const WIKI = POSTS.filter((p) => p.cat === "wikipedia").sort((a, b) => a.title.localeCompare(b.title, "de", { sensitivity: "base" }));

export const postAt = (cat: WpPost["cat"], slug: string) => POSTS.find((p) => p.cat === cat && p.slug === slug);

/** The date as the old site showed it, in German: "29. September 2026". */
export const germanDate = (iso: string) => new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(iso));

/** A few neighbours for the end of a post: the same list, nearest in its order first, never the post itself. */
export function related(post: WpPost, count = 3) {
  const list = post.cat === "uncategorized" ? BLOG : WIKI;
  const i = list.findIndex((p) => p.id === post.id);
  const near = [...list.slice(i + 1), ...list.slice(0, i)];
  return near.slice(0, count);
}
