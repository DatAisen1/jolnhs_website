import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { setConsent, useCookieConsent } from "@/lib/consent";
import { appleEase } from "@/lib/motion";

/**
 * Fixed bottom bar shown until the visitor accepts or declines optional
 * third-party storage (the Google Maps embed — the site's only one).
 * Choice persists in localStorage via lib/consent.ts; nothing is stored
 * until a button is clicked, so the banner itself is consent-free.
 *
 * Positioned bottom-left and compact so it doesn't fight the
 * bottom-right BackToTop button.
 */
export function CookieBanner() {
  const consent = useCookieConsent();
  const shouldReduceMotion = useReducedMotion();

  if (consent !== null) return null;

  return (
    <motion.div
      role="region"
      aria-label="Cookie consent"
      initial={shouldReduceMotion ? false : { y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: appleEase }}
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md sm:left-6 sm:right-auto"
    >
      <div className="rounded-xl border border-border bg-white p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-small font-semibold text-text-primary">
              A quick note on cookies
            </p>
            <p className="mt-1 text-small text-text-secondary">
              This site stores nothing of its own. The Google Map in the
              footer sets Google cookies if you load it — accept to enable
              it, or decline and use the directions link instead.{" "}
              <Link
                to="/cookie-policy"
                className="font-medium text-primary underline underline-offset-2 hover:text-primary-600"
              >
                Cookie policy
              </Link>
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="rounded-full bg-primary px-5 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setConsent("declined")}
                className="rounded-full border border-border px-5 py-2 text-small font-semibold text-text-primary transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
