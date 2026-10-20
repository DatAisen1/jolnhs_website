import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jolnhs-theme";

type Theme = "light" | "dark";

function systemPrefersDark(): boolean {
  // matchMedia is universal in real browsers but absent in jsdom (unit
  // tests) and some embedded webviews — treat "can't ask the OS" as light.
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage blocked (privacy mode) — fall through to the OS choice
  }
  return systemPrefersDark() ? "dark" : "light";
}

/**
 * useTheme
 *
 * Reads the light/dark choice resolved by the anti-FOUC script in
 * index.html (explicit saved choice, else the OS preference) and lets
 * any component flip it. The toggle persists an explicit choice to
 * localStorage; a visitor who never touches it keeps following their OS,
 * including live changes (e.g. automatic sunset switching). The `.dark`
 * class on <html> is the single switch every theme-aware token reads.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Keep following the OS while the visitor hasn't made an explicit
  // choice — the matchMedia listener only matters in that state.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* storage blocked */
      }
      if (saved !== "light" && saved !== "dark") {
        setTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage blocked — theme still flips for this tab
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
