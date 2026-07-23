import { MessageCircle } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

/**
 * Full-bleed hero image with a dark gradient overlay and a floating
 * "Contact Us" pill in the lower-right corner — matching the reference's
 * minimal, image-first hero (no headline copy sits on top of it there,
 * so we don't add any either; the next section carries the message).
 */
export function HeroBanner() {
  return (
    <section id="main-content" className="relative h-[420px] w-full overflow-hidden bg-primary-700 md:h-[520px]">
      <ImagePlaceholder
        alt="Hero photograph of the JOLNHS campus and students"
        label="Insert Hero Image Here"
        recommendedSize="1920 x 1080"
        className="h-full rounded-none border-none bg-primary-700 text-blue-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <a
        href="/contact"
        className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-small font-semibold text-primary shadow-lg transition-transform hover:scale-105 sm:bottom-10 sm:right-10"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Contact Us
      </a>
    </section>
  );
}
