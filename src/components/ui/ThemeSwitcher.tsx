import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Droplets, Moon, Palette, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";

const OPTIONS: { id: Theme; label: string; blurb: string; swatch: string; Icon: typeof Sun }[] = [
  { id: "white", label: "White", blurb: "Clean & bright", swatch: "#FFFFFF", Icon: Sun },
  { id: "sky", label: "Sky Blue", blurb: "Soft blue tint", swatch: "#DAEEFC", Icon: Droplets },
  { id: "dark", label: "Dark Navy", blurb: "Easy on the eyes", swatch: "#101F3A", Icon: Moon },
];

/**
 * ThemeSwitcher
 *
 * A floating bottom-corner control for the site's three palettes
 * (White / Sky Blue / Dark Navy) — the school's own ask for a visible,
 * always-reachable theme option rather than a toggle buried in the
 * header. One instance per layout (public + admin), mounted fixed so it
 * floats above page content; sits directly under the BackToTop pill in
 * the bottom-right corner, clear of the bottom-left cookie banner.
 * Esc/outside-click closes the panel, mirroring the mobile-nav pattern.
 */
export function ThemeSwitcher() {
  const { theme, chooseTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const active = OPTIONS.find((o) => o.id === theme) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-[900]">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Choose a color palette"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[60px] right-0 w-60 origin-bottom-right rounded-card border border-border bg-surface p-2 shadow-xl"
          >
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Color Palette
            </p>
            {OPTIONS.map(({ id, label, blurb, swatch, Icon }) => {
              const isActive = id === theme;
              return (
                <button
                  key={id}
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    chooseTheme(id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary-50 ${
                    isActive ? "bg-primary-50" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border"
                    style={{ backgroundColor: swatch }}
                  >
                    <Icon
                      size={16}
                      className={id === "dark" ? "text-secondary-100" : "text-primary"}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-small font-semibold text-text-primary">{label}</span>
                    <span className="block text-[11px] text-text-secondary">{blurb}</span>
                  </span>
                  {isActive && <Check size={16} className="shrink-0 text-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Change color palette (current: ${active.label})`}
        title="Change color palette"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-lg transition-all duration-300 ease-apple motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl"
      >
        <Palette className="h-5 w-5" aria-hidden="true" strokeWidth={1.75} />
      </button>
    </div>
  );
}
