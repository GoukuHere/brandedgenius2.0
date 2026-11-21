"use client";

import { Check, Plus, X } from "lucide-react";
import { useId, useRef, useState, type MouseEvent } from "react";
import { Container, Heading, PrimaryLink, Section } from "@/components/system/primitives";
import { useCopy } from "@/i18n/client";

/*
  Themen: a working module picker. His six topics are toggle keys (buttons with aria-pressed): a chosen key lights
  with a royal corner and a sky rim and its plus turns into a check. A tray collects the chosen modules as chips (a
  chip takes its module out again) under a count and a six-part bar in the modules' order. His button sends the
  choice: it opens an e-mail to info@brandedgenius.de with the subject "KI-Workshop" and the chosen modules one per
  line; with nothing chosen it opens a plain e-mail to the same address.

  Desktop: the keys in two columns on the left, the tray sticky on the right while the keys scroll past (inside this
  section only). Phones: one column of keys, the tray at the foot of the section.
  Round 5 (DE/EN): copy by language; in English the subject and the module names are the English ones.
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
  const keys = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const toggle = (index: number) =>
    setPicked((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)));

  // A chip removed from the keyboard hands the focus back to its key, so it is not lost with the chip.
  const removeChip = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    toggle(index);
    if (event.detail === 0) keys.current[index]?.focus();
  };

  return (
    <Section id="themen">
      <Container>
        <div className="max-w-[720px]">
          <Heading title={KW_MODULES.title} accent={KW_MODULES.accent} className="kw-break" />
          <p data-reveal="up" data-rd="2" className="t-lead mt-6 max-w-[560px]">
            {KW_MODULES.text}
          </p>
        </div>

        <div className="mt-12 grid gap-y-6 md:mt-16 lg:grid-cols-12 lg:gap-x-8">
          <ul role="list" data-reveal-group className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7">
            {ITEMS.map((item, i) => {
              const on = picked.includes(i);
              return (
                <li key={item.title}>
                  <button
                    ref={(el) => {
                      keys.current[i] = el;
                    }}
                    type="button"
                    aria-pressed={on}
                    aria-labelledby={`${baseId}-t${i}`}
                    aria-describedby={`${baseId}-d${i}`}
                    onClick={() => toggle(i)}
                    className="kw-module h-full"
                  >
                    <span className="flex items-center justify-between">
                      <span aria-hidden className="kw-module-num num text-[14px] text-white/45 transition-colors duration-300">
                        {pad(i + 1)}
                      </span>
                      <span aria-hidden className="kw-module-toggle">
                        <Plus className="kw-icon-off" strokeWidth={1.75} />
                        <Check className="kw-icon-on" strokeWidth={2.25} />
                      </span>
                    </span>
                    <span id={`${baseId}-t${i}`} className="mt-5 block text-[19px] leading-[1.22] font-medium tracking-[-0.015em] text-white sm:mt-7 lg:text-[21px]">
                      {item.title}
                    </span>
                    <span id={`${baseId}-d${i}`} className="mt-2 mb-5 block text-[15px] leading-[1.5] text-white/65">
                      {item.text}
                    </span>
                    <span aria-hidden className="kw-module-pick mt-auto block border-t border-white/10 pt-3.5 text-[13px] leading-none text-white/50">
                      {KW_MODULES.pick}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="lg:col-span-5">
            <div data-reveal="up" data-rd="2" className="kw-tray lg:sticky lg:top-[108px]">
              <div className="flex items-end justify-between gap-6">
                <p aria-hidden className="num leading-none text-white">
                  <span key={picked.length} className="kw-count inline-block text-[52px] lg:text-[64px]">
                    {pad(picked.length)}
                  </span>
                  <span className="text-[20px] text-white/40 lg:text-[24px]"> / {pad(ITEMS.length)}</span>
                </p>
                <div aria-hidden className="mb-2.5 flex w-[120px] gap-1.5 lg:w-[150px]">
                  {ITEMS.map((item, i) => (
                    <span key={item.title} className="kw-tray-seg" data-on={picked.includes(i) ? "" : undefined} />
                  ))}
                </div>
              </div>

              <div className="mt-6 min-h-[72px] border-t border-white/10 pt-6 lg:min-h-[112px]">
                {picked.length ? (
                  <ul role="list" className="flex flex-wrap gap-2">
                    {picked.map((i) => (
                      <li key={ITEMS[i].title} className="max-w-full">
                        <button type="button" aria-pressed="true" onClick={(event) => removeChip(event, i)} className="kw-chip">
                          {ITEMS[i].title}
                          <X aria-hidden strokeWidth={1.75} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-2.5 text-[15px] leading-snug text-white/55">
                    <Plus aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-sky" />
                    {KW_MODULES.pick}
                  </p>
                )}
              </div>

              <PrimaryLink
                href={mailto(KW_MODULES.mail, picked.map((i) => ITEMS[i].title))}
                className="kw-wrap-button mt-6 w-full [&_.specular-button__label]:w-full [&_.specular-button__label]:justify-between"
              >
                {KW_MODULES.cta}
              </PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
