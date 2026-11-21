import type { Locale } from "@/i18n/config";
import * as enKiWorkshop from "./en/pages/ki-workshop";
import * as enKontakt from "./en/pages/kontakt";
import * as enLeistungen from "./en/pages/leistungen";
import * as enUberUns from "./en/pages/uber-uns";
import * as enUseCases from "./en/pages/use-cases";
import * as enSite from "./en/site";
import * as deKiWorkshop from "./pages/ki-workshop";
import * as deKontakt from "./pages/kontakt";
import * as deLeistungen from "./pages/leistungen";
import * as deUberUns from "./pages/uber-uns";
import * as deUseCases from "./pages/use-cases";
import * as deSite from "./site";

/*
  All of the site's copy, per language and per page (round 5: the DE/EN switch). Components never import a copy
  module directly: client components read it with useCopy() (i18n/client.tsx), server components with getCopy()
  (i18n/server.ts), both in the language of the page being rendered.

  The German modules are the source; each English module (content/en) exports the same names in the same shape (it
  is checked against the German with Shape<...> where it is written, and keeps the German ids). The registry types
  both as the German, so a component sees one type whatever the language.
*/
const de = {
  site: deSite,
  leistungen: deLeistungen,
  useCases: deUseCases,
  kiWorkshop: deKiWorkshop,
  uberUns: deUberUns,
  kontakt: deKontakt,
};
export type Copy = typeof de;

const en = {
  site: enSite,
  leistungen: enLeistungen,
  useCases: enUseCases,
  kiWorkshop: enKiWorkshop,
  uberUns: enUberUns,
  kontakt: enKontakt,
} as unknown as Copy;

const COPY: Record<Locale, Copy> = { de, en };

export const copyFor = (locale: Locale): Copy => COPY[locale];
