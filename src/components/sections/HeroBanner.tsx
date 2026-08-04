import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion";

/**
 * Full-bleed hero VIDEO with a dark gradient overlay, a headline anchored
 * bottom-left, and a "Contact Us" pill bottom-right. `muted` + `playsInline`
 * are required for autoplay to work at all in most browsers (especially iOS
 * Safari, which otherwise forces fullscreen playback). `poster` shows while
 * the video loads and stays visible if it fails to load, so it doubles as
 * the static fallback.
 *
 * Reduced motion: when the OS setting is on, we skip the autoplaying video
 * entirely and render the static poster frame instead — a looping video is
 * exactly the kind of motion that setting exists to suppress. When motion
 * IS allowed, a pause/play control is still provided per WCAG 2.2.2
 * (Pause, Stop, Hide), since the video autoplays and loops indefinitely.
 *
 * No scroll-parallax here (unlike WhyChooseUs) — translating a <video> via
 * transform is a common source of flicker across browsers, and the video
 * itself already reads as "in motion" without it.
 */
export function HeroBanner() {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative h-[420px] w-full overflow-hidden bg-primary-700 md:h-[520px]">
      {prefersReducedMotion ? (
        <img
          src="/images/hero-poster.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <Container className="absolute inset-x-0 bottom-0 z-10 pb-16 sm:pb-20">
        <motion.div
          variants={fadeUp}
          initial={prefersReducedMotion ? "show" : "hidden"}
          animate="show"
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

      {!prefersReducedMotion && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          className="absolute left-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-10 sm:top-10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}

      <Button
        href="/contact"
        variant="secondary"
        className="absolute bottom-6 right-6 z-10 !gap-2 !rounded-full !border-0 !bg-white !px-5 !py-3 !text-small !text-primary shadow-lg transition-transform hover:!scale-105 hover:!bg-white sm:bottom-10 sm:right-10"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Contact Us
      </Button>
    </section>
  );
}
