import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, MessageCircle, Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { heroChild, heroReveal } from "@/lib/motion";

/**
 * Full-bleed hero VIDEO with a dark gradient overlay and type-dominant
 * copy anchored bottom-left. `muted` + `playsInline` are required for
 * autoplay to work at all in most browsers (especially iOS Safari, which
 * otherwise forces fullscreen playback). `poster` shows while the video
 * loads and stays visible if it fails to load, so it doubles as the
 * static fallback.
 *
 * Sizing/CTA note (Apple-style pass): height grew from 420–520px to
 * 560–760px and the headline scales up to 84px on desktop with tight
 * (-0.02em) tracking — Apple's heroes let the HEADLINE carry the visual
 * weight, not just the photo behind it. The old bottom-right floating
 * "Contact Us" pill (its own shadow, its own hover-scale) is gone; both
 * calls to action now live in the same copy block as one calm row — a
 * solid pill for the primary action and a bare text link with a chevron
 * for the secondary one, which is exactly Apple's own CTA pairing
 * (e.g. "Buy" + "Learn more >"). One grouped decision, not two
 * competing corners of the screen.
 *
 * Reduced motion: when the OS setting is on, we skip the autoplaying
 * video entirely and render the static poster frame instead — a looping
 * video is exactly the kind of motion that setting exists to suppress.
 * When motion IS allowed, a pause/play control is still provided per
 * WCAG 2.2.2 (Pause, Stop, Hide), since the video autoplays and loops
 * indefinitely.
 *
 * No scroll-parallax here (unlike WhyChooseUs) — translating a <video>
 * via transform is a common source of flicker across browsers, and the
 * video itself already reads as "in motion" without it.
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
    <section className="relative h-[560px] w-full overflow-hidden bg-primary-700 md:h-[680px] lg:h-[760px]">
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />

      <Container className="absolute inset-x-0 bottom-0 z-10 pb-14 sm:pb-16 lg:pb-20">
        <motion.div
          variants={heroReveal}
          initial={prefersReducedMotion ? "show" : "hidden"}
          animate="show"
          className="max-w-3xl"
        >
          <motion.p
            variants={heroChild}
            className="mb-4 text-small font-semibold uppercase tracking-[0.18em] text-secondary-light"
          >
            Julia Ortiz Luis National High School
          </motion.p>
          <motion.h1
            variants={heroChild}
            className="text-[44px] font-bold leading-[1.02] tracking-tight text-white sm:text-[60px] lg:text-hero"
          >
            Molding Minds.
            <br />
            Building Futures.
          </motion.h1>
          <motion.p
            variants={heroChild}
            className="mt-5 max-w-md text-body text-secondary-50"
          >
            A public secondary school committed to quality, inclusive, and
            community-centered education for every learner.
          </motion.p>

          {/* One grouped CTA decision — a solid primary pill next to a
              bare text link, Apple's own "Buy" / "Learn more >" pairing —
              instead of two separately-styled buttons fighting for
              attention in opposite corners of the hero. */}
          <motion.div variants={heroChild} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button
              href="/contact"
              variant="secondary"
              className="!gap-2 !rounded-full !border-0 !bg-white !px-6 !py-3 !text-small !text-primary transition-[filter] duration-300 ease-apple hover:!bg-white hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </Button>
            <a
              href="/about"
              className="group inline-flex items-center gap-1 text-small font-semibold text-white/90 transition-colors duration-300 ease-apple hover:text-white"
            >
              Learn more about our school
              <ChevronRight
                className="h-4 w-4 transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </motion.div>
      </Container>

      {!prefersReducedMotion && (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          className="absolute left-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors duration-300 ease-apple hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-10 sm:top-10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </section>
  );
}