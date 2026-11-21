"use client";

import { createContext, useContext, type ReactNode } from "react";
import { copyFor, type Copy } from "@/content/copy";
import { DEFAULT_LOCALE, pathFor, type Locale, type PageKey } from "./config";

/*
  The language of the page being rendered, for client components (round 5, the DE/EN switch). SiteShell sets it from
  the route; useCopy() gives that language's copy, useLocale() the language itself and useHref() a page's address in
  it. Server components use i18n/server.ts instead.
*/
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export const useCopy = (): Copy => copyFor(useContext(LocaleContext));

/** A page's address in the current language: useHref()("kontakt") is "/kontakt" or "/en/contact". */
export function useHref() {
  const locale = useContext(LocaleContext);
  return (page: PageKey, hash?: string) => pathFor(locale, page, hash);
}

/** Picks the current language's entry from a small { de, en } table (component-level words such as labels). */
export function useWords<T>(table: Record<Locale, T>): T {
  return table[useContext(LocaleContext)];
}
