import { Link } from "react-router-dom";
import { ArrowRight, Megaphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/pages/NewsPage";
import { usePublishedAnnouncements } from "@/lib/data/announcements";

/**
 * Latest announcements band on the homepage. Renders nothing at all
 * when there are no published items — a homepage shouldn't show a
 * "no news" empty box to first-time visitors; the section simply
 * isn't part of the page until there's something worth saying.
 */
export function LatestAnnouncements() {
  const { data: items, isLoading } = usePublishedAnnouncements(3);

  if (isLoading || !items || items.length === 0) return null;

  return (
    <section className="bg-surface py-section-sm md:py-section" aria-labelledby="latest-news">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-small font-semibold uppercase tracking-[0.16em] text-primary">
              <Megaphone size={16} aria-hidden="true" /> Latest updates
            </p>
            <h2 id="latest-news" className="font-heading text-heading text-text-primary">
              News & Announcements
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-primary transition-colors hover:text-primary-600"
          >
            View all announcements <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </Container>
    </section>
  );
}
