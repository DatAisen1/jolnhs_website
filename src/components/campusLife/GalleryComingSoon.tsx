import { Facebook, ImageIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { useSiteSettings, getSettingValue } from "@/lib/data/siteSettings";

/**
 * GalleryComingSoon — the gallery's honest empty state.
 *
 * Every gallery slot in the static data is a label for a photo that
 * doesn't exist yet; rendering them as a grid of "Insert X Photo Here"
 * tiles exposes developer annotation to visitors. This panel says the
 * same thing in visitor language and points at the school's Facebook
 * page — the place real photos already live today.
 *
 * Renders full-width; the parent GalleryGrid swaps it in when no item
 * in the set has a real `src` yet.
 */
export function GalleryComingSoon() {
  const shouldReduceMotion = useReducedMotion();
  const { data: siteSettings = [] } = useSiteSettings();
  const facebookUrl = getSettingValue(siteSettings, "facebook_url");

  return (
    <motion.div
      variants={fadeUp}
      initial={shouldReduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-primary-200 bg-primary-50 px-6 py-14 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ImageIcon className="h-6 w-6 text-primary" aria-hidden="true" />
      </span>
      <div>
        <p className="text-subtitle text-text-primary">Photos coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-small text-text-secondary">
          We're putting together the photo gallery for this section.
          {facebookUrl
            ? " In the meantime, the latest photos are on our Facebook page."
            : " Check back soon."}
        </p>
      </div>
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-small font-semibold text-white transition-colors duration-300 ease-apple hover:bg-primary-600"
        >
          <Facebook className="h-4 w-4" aria-hidden="true" />
          See photos on Facebook
        </a>
      )}
    </motion.div>
  );
}
