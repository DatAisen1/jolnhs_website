import { useSyncExternalStore } from "react";

/**
 * Visitor cookie/storage consent.
 *
 * The public site sets no cookies of its own; the one non-essential
 * third party is the Google Maps embed in the footer (Google sets
 * cookies when it loads). So consent is a single binary choice that
 * gates that embed — nothing else reads it.
 *
 * The choice lives in localStorage under CONSENT_KEY, versioned so a
 * future policy change can bump CONSENT_VERSION and re-ask everyone.
 * localStorage (not a cookie) keeps the choice out of every request and
 * is disclosed in the cookie policy as essential storage.
 */

export const CONSENT_KEY = "jolnhs-cookie-consent";
export const CONSENT_VERSION = 1;

export type ConsentChoice = "accepted" | "declined";

interface StoredConsent {
  v: number;
  choice: ConsentChoice;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.v === CONSENT_VERSION ? parsed.choice : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  window.localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ v: CONSENT_VERSION, choice } satisfies StoredConsent)
  );
  emit();
}

export function clearConsent(): void {
  window.localStorage.removeItem(CONSENT_KEY);
  emit();
}

/** getSnapshot must return a stable value between actual changes —
 *  ConsentChoice is a primitive, so plain equality keeps
 *  useSyncExternalStore from re-render loops. */
const getSnapshot = getConsent;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Another tab changing consent fires "storage" on this one.
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns the saved choice, or null while undecided — reactive across
 *  the banner, map gate, and cookie-policy reset button. */
export function useCookieConsent(): ConsentChoice | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}
