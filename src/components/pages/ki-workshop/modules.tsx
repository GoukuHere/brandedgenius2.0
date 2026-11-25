"use client";

import { Check, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";

/*
  Themen: his six topics as toggle keys (buttons with aria-pressed). A chosen key lights with a royal corner and a sky
  rim and its plus turns into a check. His button sends the choice: it opens an e-mail to info@brandedgenius.de with the
  subject "KI-Workshop" and the chosen modules one per line; with nothing chosen it opens a plain e-mail to the same
  address.
  Round 5 (DE/EN): copy by language; in English the subject and the module names are the English ones.
  Round 7 (Roman's Loom of 2026-11-24): "It looks cool here, also with the plus", but the tray on the right "makes no
  sense ... remove that on the right side ... one section with this hero centralized". The tray (count, bar, chips) is
  gone: his heading and line centred, the six keys in one block (three columns on desktop, so all six fit his laptop's
  screen), and under them his "Modul für Workshop wählbar" once, beside his button.
*/

const pad = (n: number) => String(n).padStart(2, "0");

/** The e-mail link for a choice: the subject and the module names, one per line, encoded for a mailto address. */
function mailto({ to, subject }: { to: string; subject: string }, names: string[]) {
  if (!names.length) return `mailto:${to}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(names.join("\r\n"))}`;
}

export function KwModules() {
  const { KW_MODULES } = useCopy().kiWorkshop;
  const ITEMS = KW_MODULES.items;
  const [picked, setPicked] = useState<number[]>([]);
  const baseId = useId();

  const toggle = (index: number) =>
    setPicked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)));

  return (
    <Section id="themen">
      <Container>
        <div className="mx-auto max-w-[900px] text-center">
          <Heading title={KW_MODULES.title} accent={KW_MODULES.accent} className="kw-break kw-center" />
          <p data-reveal="up" data-rd="2" className="t-lead mx-auto mt-4 max-w-[620px] lg:max-w-[900px]">
            {KW_MODULES.text}
          </p>
        </div>

        {/* Each key: his number and title on one line with the plus beside them, his line under them. */}
        <ul role="list" data-reveal-group className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {ITEMS.map((item, i) => {
            const on = picked.includes(i);
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-labelledby={`${baseId}-t${i}`}
                  aria-describedby={`${baseId}-d${i}`}
                  onClick={() => toggle(i)}
                  className="kw-module h-full"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="flex min-w-0 items-baseline gap-3 pt-1">
                      <span aria-hidden className="kw-module-num num shrink-0 text-[14px] text-white/45 transition-colors duration-300">
                        {pad(i + 1)}
                      </span>
                      <span id={`${baseId}-t${i}`} className="block text-[19px] leading-[1.22] font-medium tracking-[-0.015em] text-white lg:text-[20px]">
                        {item.title}
                      </span>
                    </span>
                    <span aria-hidden className="kw-module-toggle">
                      <Plus className="kw-icon-off" strokeWidth={1.75} />
                      <Check className="kw-icon-on" strokeWidth={2.25} />
                    </span>
                  </span>
                  <span id={`${baseId}-d${i}`} className="mt-2.5 block text-[15px] leading-[1.5] text-white/65">
                    {item.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div data-reveal="up" className="mt-7 flex flex-col items-center gap-4 md:mt-6 md:flex-row md:justify-center md:gap-7">
          <p className="flex items-center gap-2.5 text-[15px] leading-snug text-white/60">
            <Plus aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-sky" />
            {KW_MODULES.pick}
          </p>
          <PrimaryLink href={mailto(KW_MODULES.mail, picked.map((i) => ITEMS[i].title))} className="kw-wrap-button">
            {KW_MODULES.cta}
          </PrimaryLink>
        </div>
      </Container>
    </Section>
  );
}
