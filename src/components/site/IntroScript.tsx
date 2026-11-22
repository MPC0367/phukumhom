"use client";

import { useSyncExternalStore } from "react";

/**
 * The opening's inline script, in the server's HTML only.
 *
 * It has to run while the browser parses the first page, before anything below it is painted, so it is an
 * inline <script>. React will not run (and warns about) a script it creates itself in the browser, which
 * happens when the site shell is mounted again, for example on a language switch. So: the snapshot is
 * `true` on the server and while React hydrates that HTML (the script is matched, never created), and
 * `false` for every render after that (React removes the spent tag, and never creates a new one).
 */

const subscribe = () => () => {};

export function IntroScript({ code }: { code: string }) {
  const firstDocument = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
  return firstDocument ? <script dangerouslySetInnerHTML={{ __html: code }} /> : null;
}
