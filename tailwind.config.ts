import type { Config } from "tailwindcss";

// Design tokens are centralized here so every color/spacing/type decision
// in the codebase traces back to ONE source of truth (no magic hex values
// scattered across components).
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A", // Deep Academic Blue
          50: "#EEF2FB",
          100: "#D6DFF5",
          600: "#1E40AF", // hover
          700: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#3B82F6", // Sky Blue
        },
        surface: "#FFFFFF",
        background: "#F8FAFC",
        border: "#E2E8F0",
        text: {
          primary: "#0F172A",
          secondary: "#475569",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
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
