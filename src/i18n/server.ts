import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { copyFor, type Copy } from "@/content/copy";
import { isLocale, pathFor, type Locale, type PageKey } from "./config";

/*
  The language of the page being rendered, for server components (round 5, the DE/EN switch): the [lang] root
  segment, read through next/root-params, so no component needs it passed down. Client components use
  i18n/client.tsx.
*/
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getCopy(): Promise<Copy> {
  return copyFor(await getLocale());
}

/** A page's address in the current language. */
export async function getHref(page: PageKey, hash?: string) {
  return pathFor(await getLocale(), page, hash);
}

/** Picks the current language's entry from a small { de, en } table. */
export async function getWords<T>(table: Record<Locale, T>): Promise<T> {
  return table[await getLocale()];
}
