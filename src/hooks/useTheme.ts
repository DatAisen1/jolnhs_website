import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jolnhs-theme";

export type Theme = "white" | "sky" | "dark";

const THEMES: readonly Theme[] = ["white", "sky", "dark"];

function systemPrefersDark(): boolean {
  // matchMedia is universal in real browsers but absent in jsdom (unit
  // tests) and some embedded webviews — treat "can't ask the OS" as white.
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function savedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") return "white"; // migrate the pre-sky choice
    if (saved && (THEMES as readonly string[]).includes(saved)) return saved as Theme;
  } catch {
    // storage blocked (privacy mode) — fall through to the OS choice
  }
  return null;
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("theme-sky", theme === "sky");
}

/**
 * useTheme
 *
 * The three-way palette switch: White (default light), Sky Blue (tinted
 * light) and Dark Navy. Precedence: explicit saved choice, else the OS
 * dark-mode preference (dark vs white; sky is always an explicit pick).
 * A visitor who never touches the switcher keeps following their OS,
 * including live sunset switching. Theme classes land on <html> —
 * `.dark` and `.theme-sky` flip the CSS-variable tokens in index.css.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? (systemPrefersDark() ? "dark" : "white"));

  // Keep following the OS while the visitor hasn't made an explicit
  // choice — the matchMedia listener only matters in that state.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (savedTheme() === null) setTheme(media.matches ? "dark" : "white");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => applyThemeClass(theme), [theme]);

  const chooseTheme = useCallback((next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked — theme still flips for this tab
    }
  }, []);

  return { theme, chooseTheme };
}
