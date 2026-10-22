import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Megaphone, Pin } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PageStatus } from "@/components/ui/PageStatus";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  CATEGORY_LABELS,
  coverImageUrl,
  usePublishedAnnouncements,
  type Announcement,
  type AnnouncementCategory,
} from "@/lib/data/announcements";

const FILTER_TABS: Array<{ slug: string; label: string }> = [
  { slug: "all", label: "All" },
  { slug: "announcement", label: "Announcements" },
  { slug: "news", label: "News" },
  { slug: "event", label: "Events" },
  { slug: "advisory", label: "Advisories" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsCard({ item }: { item: Announcement }) {
  const cover = coverImageUrl(item.cover_image_path);
  return (
    <Link
      to={`/news/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-background">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/8 text-primary">
            <Megaphone size={28} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            {CATEGORY_LABELS[item.category]}
          </span>
          {item.is_pinned && <Pin size={12} className="text-primary" aria-label="Pinned" />}
          <span className="ml-auto inline-flex items-center gap-1">
            <Calendar size={12} aria-hidden="true" />
            {formatDate(item.published_at ?? item.created_at)}
          </span>
        </div>
        <h2 className="mt-3 font-heading text-subtitle leading-snug text-text-primary group-hover:text-primary">
          {item.title}
        </h2>
        {(item.excerpt || item.body) && (
          <p className="mt-2 line-clamp-2 text-small text-text-secondary">
            {item.excerpt || item.body}
          </p>
        )}
      </div>
    </Link>
  );
}

export function NewsPage() {
  usePageTitle("News & Announcements");
  const [category, setCategory] = useState<"all" | AnnouncementCategory>("all");
  const { data: items, isLoading, isError, refetch } = usePublishedAnnouncements();

  const filtered = category === "all" ? items : items?.filter((i) => i.category === category);

  return (
    <>
      <PageHero
        eyebrow="Stay informed"
        title="News & Announcements"
        description="Official announcements, school news, events, and advisories from Julia Ortiz Luis National High School."
        origami="megaphone"
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "News" }]} />
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <div className="mb-8 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Filter by category">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.slug}
                role="tab"
                aria-selected={category === tab.slug}
                onClick={() => setCategory(tab.slug as typeof category)}
                className={`shrink-0 px-4 py-2.5 text-small font-medium transition-colors ${
                  category === tab.slug
                    ? "border-b-2 border-primary text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && <PageStatus variant="loading" message="Loading announcements…" />}
          {isError && (
            <PageStatus
              variant="error"
              message="Announcements couldn't be loaded right now."
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-small font-medium text-text-primary hover:bg-background"
                >
                  Try again
                </button>
              }
            />
          )}

          {filtered && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <Megaphone className="mx-auto text-text-secondary" size={28} aria-hidden="true" />
              <h2 className="mt-3 font-heading text-subtitle text-text-primary">Nothing here yet</h2>
              <p className="mx-auto mt-1 max-w-md text-small text-text-secondary">
                {category === "all"
                  ? "There are no published announcements right now. Check back soon — school updates appear here as they're released."
                  : `No ${CATEGORY_LABELS[category as AnnouncementCategory].toLowerCase()} posts at the moment.`}
              </p>
            </div>
          )}

          {filtered && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
