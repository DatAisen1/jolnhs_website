import { useEffect } from "react";

/**
 * Keeps admin pages out of search engines: sets
 * <meta name="robots" content="noindex, nofollow"> while mounted and
 * restores the previous state on unmount. Deliberately not a robots.txt
 * Disallow — that file is public, and listing /admin there would
 * advertise the admin path to anyone curious.
 */
export function useNoIndex() {
  useEffect(() => {
    const existing = document.head.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const previous = existing?.content ?? null;
    const meta = existing ?? document.createElement("meta");
    if (!existing) {
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    return () => {
      if (previous === null) meta.remove();
      else meta.content = previous;
    };
  }, []);
}
