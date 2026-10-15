// Media for the homepage hero. Point these at real files once they
// exist in public/ — until then the hero renders its designed gradient
// state and nothing 404s.
//
//   videoSrc  → drop an mp4 in public/videos/ and set e.g. "/videos/hero.mp4"
//   posterSrc → drop the hero photo via scripts/optimize-image.mjs and
//               set e.g. "/images/site/hero-poster.webp" (1920 x 1080)
//
// The poster doubles as the no-video fallback and the
// prefers-reduced-motion still frame.

export const heroMedia = {
  videoSrc: undefined as string | undefined,
  posterSrc: "/images/site/hero-poster.webp" as string | undefined,
};
