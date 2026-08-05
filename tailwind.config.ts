import type { Config } from "tailwindcss";

// Design tokens are centralized here so every color/spacing/type decision
// in the codebase traces back to ONE source of truth (no magic hex values
// scattered across components).
//
// Palette: deep blue + white — refined for a premium, editorial feel:
// a richer ink-navy (less "primary-color-blue", more "private bank/
// university" blue), a full 50–900 tonal scale so every accent, hover
// state, and gradient stop stays in the SAME family instead of falling
// back to Tailwind's default blue/sky swatches, and a warmer, quieter
// off-white background instead of a cool slate-gray one.
// Change ONLY these hex values to re-theme the entire site.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF3FC",
          100: "#D7E4F6",
          200: "#AFC8EC",
          300: "#7FA6DD",
          400: "#4C7DC8",
          DEFAULT: "#1C3E7C", // deep academic blue — main brand color
          600: "#2955A3", // hover state — richer, more saturated sapphire (not just "lighter")
          700: "#0F2148", // darkest tier — utility bar, dark section shade
          800: "#0A1730",
          900: "#050D1C", // near-ink navy — reserved for maximum-depth moments
        },
        secondary: {
          DEFAULT: "#FFFFFF", // White — nav bar / CTA block color
          50: "#F7FAFF", // near-white blue tint — light text on very dark panels
          100: "#E8F1FC", // pale sky-blue — light text on dark panels
          300: "#9FC3F0", // refined sky-blue — hover accents, decorative icons on dark backgrounds
          light: "#9FC3F0", // alias kept for existing call sites — same value as 300
        },
        surface: "#FFFFFF",
        background: "#F9FBFD", // quiet, warm-leaning off-white — reads calmer than a cool slate gray
        border: "#E1E7F0",
        text: {
          primary: "#0B1730", // deep ink-navy instead of generic slate — ties body copy into the brand
          secondary: "#4A5B7C", // blue-gray secondary text, same family as primary
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // body text, UI, buttons, nav
        heading: ["Playfair Display", "Georgia", "serif"], // h1–h4 only, see index.css base layer
      },
      fontSize: {
        hero: ["60px", { lineHeight: "1.05", fontWeight: "800" }],
        heading: ["40px", { lineHeight: "1.15", fontWeight: "700" }],
        section: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        subtitle: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      maxWidth: {
        page: "1440px",
        content: "1280px",
      },
      spacing: {
        section: "120px",
        "section-sm": "64px", // mobile section spacing (120px is too much on small screens)
        card: "32px",
      },
      borderRadius: {
        card: "16px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;