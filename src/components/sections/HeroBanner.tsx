import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Full-bleed hero VIDEO with a dark gradient overlay, a headline anchored
 * bottom-left, and a floating "Contact Us" pill bottom-right. `muted` +
 * `playsInline` are required for autoplay to work at all in most browsers
 * (especially iOS Safari, which otherwise forces fullscreen playback).
 * `poster` shows while the video loads and stays visible if it fails to
 * load, so it doubles as the static fallback.
 *
 * No scroll-parallax here (unlike WhyChooseUs) — translating a <video> via
 * transform is a common source of flicker across browsers, and the video
 * itself already reads as "in motion" without it.
 */
export function HeroBanner() {
  return (
    <section
      id="main-content"
      className="relative h-[420px] w-full overflow-hidden bg-primary-700 md:h-[520px]"
    >
      {
<video
  autoPlay
  muted
  loop
  playsInline
  poster="/images/hero-poster.jpg"
  className="absolute inset-0 h-full w-full object-cover"
>
  <source src="public/videos/Jolnhs Promotional Video.mp4" type="video/mp4" />
</video>
}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <Container className="absolute inset-x-0 bottom-0 z-10 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="mb-3 text-small font-semibold uppercase tracking-widest text-secondary-light">
            Julia Ortiz Luis National High School
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Molding Minds. Building Futures.
          </h1>
          <p className="mt-4 max-w-md text-body text-blue-50">
            A public secondary school committed to quality, inclusive, and
            community-centered education for every learner.
          </p>
        </motion.div>
      </Container>

      <a
        href="/contact"
        className="absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-small font-semibold text-primary shadow-lg transition-transform hover:scale-105 sm:bottom-10 sm:right-10"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Contact Us
      </a>
    </section>
  );
}