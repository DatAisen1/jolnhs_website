import { Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { utilityLinksLeft, utilityLinksRight } from "@/data/utilityLinks";

/**
 * TopUtilityBar
 *
 * WHAT: A slim, dark strip above the main header carrying secondary
 *       utility links (Services/Apply/Visit + a search field) and
 *       external portal links (Google Classroom, Student/Faculty Portal).
 * WHY:  Keeps day-to-day "get something done" links (portals, search) out
 *       of the primary navigation, which is reserved for informational
 *       site sections — a common institutional-site pattern.
 * WHEN NOT: Skip this bar entirely on pages/sites with no login portals
 *           or external tools to link to.
 */
export function TopUtilityBar() {
  return (
    <div className="hidden bg-primary-700 text-white md:block">
      <Container className="flex h-9 items-center justify-between text-small">
        <div className="flex items-center gap-6">
          {utilityLinksLeft.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-blue-50/90 transition-colors hover:text-secondary-light"
            >
              {link.label}
            </a>
          ))}
          <label className="flex items-center gap-2 border-l border-white/20 pl-6">
            <Search className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
            <span className="sr-only">Search our site</span>
            <input
              type="search"
              placeholder="Search our site"
              className="w-40 bg-transparent text-small text-white placeholder:text-white/50 focus-visible:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-6">
          {utilityLinksRight.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-blue-50/90 transition-colors hover:text-secondary-light"
            >
              {link.label}
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
}
