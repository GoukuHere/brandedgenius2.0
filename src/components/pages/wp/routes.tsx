import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaSection } from "@/components/sections/cta";
import { SiteShell } from "@/components/site/site-shell";
import { BLOG, LEGAL, LISTS, WIKI, postAt, type LegalKey, type WpPost } from "@/content/wp";
import { getLocale } from "@/i18n/server";
import { germanMetadata } from "@/lib/seo";
import { BlogList, Glossary, LegalPage, PostArticle } from "./wp";

/*
  What the WordPress routes under app/[lang] share (2026-11-24). These pages exist in German only, as on the old site:
  an English address answers 404 (the English pages link to the German legal pages and lists).
*/

/** A post's params: every slug in German; in English one (Cache Components refuses an empty list) that answers 404. */
export function postParams(cat: WpPost["cat"], lang: string) {
  const slugs = (cat === "uncategorized" ? BLOG : WIKI).map((p) => ({ slug: p.slug }));
  return lang === "de" ? slugs : slugs.slice(0, 1);
}

export async function postMetadata(cat: WpPost["cat"], params: Promise<{ slug: string }>): Promise<Metadata> {
  const post = postAt(cat, (await params).slug);
  if (!post) return {};
  return germanMetadata(post.path, {
    title: post.seoTitle ?? post.title,
    description: post.description ?? post.excerpt,
    image: post.image,
    type: "article",
    published: post.date,
    modified: post.modified,
  });
}

export async function PostRoute({ cat, params }: { cat: WpPost["cat"]; params: Promise<{ slug: string }> }) {
  const post = postAt(cat, (await params).slug);
  if (!post || (await getLocale()) !== "de") notFound();
  return (
    <SiteShell>
      <PostArticle post={post} />
      <CtaSection />
    </SiteShell>
  );
}

export function listMetadata(key: keyof typeof LISTS): Metadata {
  const page = LISTS[key];
  return germanMetadata(page.path, { title: page.seoTitle, description: page.description });
}

export async function ListRoute({ list }: { list: keyof typeof LISTS }) {
  if ((await getLocale()) !== "de") notFound();
  return <SiteShell>{list === "blog" ? <BlogList /> : <Glossary />}</SiteShell>;
}

export function legalMetadata(key: LegalKey): Metadata {
  const page = LEGAL[key];
  return germanMetadata(page.path, { title: page.seoTitle, description: page.description });
}

export async function LegalRoute({ page }: { page: LegalKey }) {
  if ((await getLocale()) !== "de") notFound();
  return (
    <SiteShell>
      <LegalPage page={LEGAL[page]} />
    </SiteShell>
  );
}
