import type { Variants } from "framer-motion";

/**
 * appleEase
 *
 * WHAT: A single expo-out cubic-bezier used by every animated reveal on
 *       the site — hero, section headings, cards, the mobile nav panel.
 * WHY:  Apple's marketing site rides one deceleration curve everywhere
 *       instead of mixing easeOut/easeIn/spring per component. That
 *       consistency is what reads as "considered" rather than "assembled
 *       from a component library" — every element decelerates the same
 *       way, so the whole page feels like one physical system rather
 *       than a bag of independently-tuned widgets.
 * WHEN NOT: Springs still belong where something needs to feel alive and
 *           interactive (the nav's sliding pill in NavDropdown.tsx keeps
 *           its spring) — this curve is for one-shot ENTRANCES, not
 *           continuous interactive feedback.
 */
export const appleEase = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: appleEase } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: appleEase } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: appleEase } },
};

/**
 * heroReveal / heroChild
 *
 * WHAT: A staggered pair for hero-style blocks — eyebrow, headline, and
 *       supporting paragraph rise in sequence (80ms apart) rather than
 *       all at once.
 * WHY:  Apple's hero copy never appears as one flat block; the eyebrow
 *       leads by a beat, then the headline, then the subhead — it reads
 *       as a sentence being composed, not a slide being pasted in.
 * WHEN: Wrap the outer block in `heroReveal`, each direct child (eyebrow/
 *       h1/paragraph) in a `motion.div variants={heroChild}` — no
 *       `initial`/`whileInView` needed on the children, the parent's
 *       stagger drives them.
 */
export const heroReveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: appleEase } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

// `amount: 0.3` (its previous value) required 30% of the ELEMENT's own
// height to be inside the viewport before triggering — fine for short
// elements, but a section taller than ~3x the visible viewport height
// (e.g. a tall image-paired row viewed in a short window, such as a
// laptop screen with DevTools docked at the bottom) can never satisfy
// that threshold and gets stuck in its `hidden` state permanently.
// `amount: "some"` fires as soon as ANY part of the element is visible —
// height-independent, so it can't get stuck regardless of viewport size.
export const viewportOnce = { once: true, amount: "some" } as const;