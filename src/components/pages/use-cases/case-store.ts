import type { ProjectSlug } from "@/content/pages/use-cases";

/*
  The open case study, shared by the posters and the featured Mega Screen block (both open the same case view). A
  tiny store read with useSyncExternalStore: the server and the first client render see no open case.
*/

type Listener = () => void;

let current: ProjectSlug | null = null;
let opener: HTMLElement | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((listener) => listener());

export const caseStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: (): ProjectSlug | null => current,
  getServer: (): ProjectSlug | null => null,
  /** Opens a case; `from` gets the focus back when the case view closes. */
  open(slug: ProjectSlug, from?: HTMLElement | null) {
    opener = from ?? null;
    current = slug;
    emit();
  },
  close() {
    current = null;
    emit();
  },
  /** The element that opened the case view (the view returns focus to it); kept until the next open. */
  opener(): HTMLElement | null {
    return opener?.isConnected ? opener : null;
  },
};
