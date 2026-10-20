import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  /** Rendered on a navy glass header (public) or a surface card (admin). */
  onDark?: boolean;
  className?: string;
}

/**
 * ThemeToggle
 *
 * The light/dark switch for site chrome. One instance must mount per
 * layout (public Header, MobileNav, AdminLayout) — each useTheme call
 * just reads and flips the shared `.dark` class, so multiple mounted
 * toggles stay in sync by construction.
 *
 * Visual language matches the site's control tokens: circular button,
 * tokenized border/text colors so it reads correctly in both themes,
 * and the same apple easing as the buttons it sits next to.
 */
export function ThemeToggle({ onDark = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ease-apple motion-safe:hover:-translate-y-0.5 ${
        onDark
          ? "border-white/20 bg-white/10 text-secondary-100 hover:bg-white/20"
          : "border-border bg-surface text-text-secondary hover:border-primary-300 hover:text-primary"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.75} />
      )}
    </button>
  );
}
