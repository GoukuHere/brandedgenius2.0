"use client";

import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { PrimaryLink, SecondaryLink } from "@/components/system/primitives";
import type { Project } from "@/content/pages/use-cases";
import { useCopy } from "@/i18n/client";
import { caseStore } from "./case-store";

/*
  The full case view (2026-11-16): his popup for one project, as a panel over the page with his text in order:
  Projektübersicht, Ausgangssituation & Herausforderung, the solution points as a checklist, Mehrwert, then his
  question and his two buttons. Phones: one sheet over the whole screen.
  Round 7 (Roman's Loom of 2026-11-24): the animated cover drawing beside the text is gone with the posters' drawings
  ("not really fitting to the logos, the brands"), so the panel is one column of his text.

  A modal dialog: focus moves to the close button, Tab stays inside, Escape, the cross and a click beside the panel
  close it, and focus returns to the poster (or button) that opened it. The page is held while it is open: the body
  gets `overflow-hidden`, which SmoothScroll reads to stop Lenis, and the panel's own scroller is marked
  `data-lenis-prevent`. It is rendered into <body> inside a `.v11` box, so the site's v11 tokens and buttons apply.
  Round 5 (DE/EN): copy by language (the portal keeps the page's language context).
*/

const EASE = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const subscribeNever = () => () => {};

export function CaseView() {
  const { UC_ITEMS } = useCopy().useCases;
  const slug = useSyncExternalStore(caseStore.subscribe, caseStore.get, caseStore.getServer);
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!ready) return null;
  const project = slug ? (UC_ITEMS.find((item) => item.slug === slug) ?? null) : null;
  return createPortal(
    <div className="v11">
      <AnimatePresence>{project && <CaseDialog key={project.slug} project={project} />}</AnimatePresence>
    </div>,
    document.body
  );
}

/** Keeps Tab and Shift+Tab inside the panel. */
function keepFocus(event: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const outside = !root.contains(active);
  if (event.shiftKey ? outside || active === first : outside || active === last) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

function CaseDialog({ project }: { project: Project }) {
  const copy = useCopy();
  const { UC_CASE } = copy.useCases;
  const { LINKS } = copy.site;
  const panel = useRef<HTMLDivElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const close = () => caseStore.close();

  useEffect(() => {
    const body = document.body;
    // The scrollbar goes while the page is held; its width is kept as padding so nothing behind the panel shifts.
    const bar = window.innerWidth - document.documentElement.clientWidth;
    if (bar > 0) body.style.paddingRight = `${bar}px`;
    body.classList.add("overflow-hidden");
    closer.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        caseStore.close();
      } else if (event.key === "Tab") {
        keepFocus(event, panel.current);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.classList.remove("overflow-hidden");
      body.style.paddingRight = "";
      caseStore.opener()?.focus({ preventScroll: true });
    };
  }, []);

  const rows = [
    { title: UC_CASE.overview, body: <p className="uc-case-lead">{project.overview}</p> },
    { title: UC_CASE.challenge, body: <p>{project.challenge}</p> },
    {
      title: UC_CASE.solution,
      body: (
        <ul role="list" className="uc-case-checks">
          {project.solution.map((point) => (
            <li key={point}>
              <Check aria-hidden strokeWidth={1.75} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ),
    },
    { title: UC_CASE.value, body: <p className="uc-case-value">{UC_CASE.valueText}</p> },
  ];

  return (
    <motion.div className="uc-case" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div aria-hidden className="uc-case-backdrop" onClick={close} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="uc-case-panel"
        initial={{ opacity: 0, y: 36, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.985 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <button ref={closer} type="button" onClick={close} aria-label={UC_CASE.close} className="uc-case-close">
          <X aria-hidden strokeWidth={1.5} />
        </button>

        <div className="uc-case-scroll" data-lenis-prevent>
          <div className="uc-case-body">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: EASE }}>
              <h2 id={titleId} className="uc-case-title">
                {project.name}
              </h2>
              <p className="uc-case-meta">
                {UC_CASE.project} {project.number} · {project.tag}
              </p>
            </motion.div>

            <div className="uc-case-rows">
              {rows.map((row, i) => (
                <motion.section
                  key={row.title}
                  className="uc-case-row"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: EASE }}
                >
                  <h3>{row.title}</h3>
                  <div>{row.body}</div>
                </motion.section>
              ))}
            </div>

            <motion.div
              className="uc-case-cta"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            >
              <p>{UC_CASE.question}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href={LINKS.booking}>{UC_CASE.booking}</PrimaryLink>
                <SecondaryLink href={LINKS.contact}>{UC_CASE.contact}</SecondaryLink>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
