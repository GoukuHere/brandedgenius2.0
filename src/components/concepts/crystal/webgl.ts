"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";

/* Shared by the two glass versions (v8, v9): whether the browser can draw the stage, and a guard around it. */

let support: boolean | null = null;
const detect = () => {
  if (support === null) {
    try {
      support = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      support = false;
    }
  }
  return support;
};
const subscribeNothing = () => () => {};

/** WebGL 2, safe to hydrate: false on the server and while hydrating, then whether the browser has it. */
export function useWebGL() {
  return useSyncExternalStore(subscribeNothing, detect, () => false);
}

/** If the stage fails, the page simply goes on without it. */
export class StageGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
