"use client";

import { useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";

/**
 * Was this component's HTML sent by the server and painted before any script ran, or was it created in
 * the browser by a later navigation?
 *
 * The difference decides whether an entrance may run. Content the visitor has already been looking at
 * must not be hidden so that it can be revealed; content React has only just created has never been
 * seen and can arrive however it likes.
 *
 *   const serverPainted = useServerPainted();
 *   useGSAP(() => { if (serverPainted.current) … }, []);
 *
 * It answers from how React itself rendered the component (useSyncExternalStore gives the server
 * snapshot only while hydrating), not from when the motion provider booted, so it is right wherever the
 * provider sits in the tree and however many times development mode replays the effects.
 *
 * The ref is null until the first layout effect and never changes after it. Call this hook BEFORE the
 * effect that reads it.
 */

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useServerPainted(): RefObject<boolean | null> {
  const hydrating = !useSyncExternalStore(subscribe, onClient, onServer);
  const painted = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    if (painted.current === null) painted.current = hydrating;
  }, [hydrating]);
  return painted;
}
