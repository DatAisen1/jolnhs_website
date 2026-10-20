import { useParams } from "react-router-dom";
import { Calendar, Languages, Megaphone } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageStatus } from "@/components/ui/PageStatus";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  CATEGORY_LABELS,
  coverImageUrl,
  useAnnouncementBySlug,
} from "@/lib/data/announcements";

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: item, isLoading, isError, refetch } = useAnnouncementBySlug(slug);

  usePageTitle(item ? item.title : "News");

  const cover = coverImageUrl(item?.cover_image_path);
  const hasFilipino = !!(item?.title_fil || item?.body_fil);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: item?.title ?? "…" },
        ]}
      />
      <article className="bg-background py-section-sm md:py-section">
        <Container>
          {isLoading && <PageStatus variant="loading" message="Loading…" />}
          {isError && (
            <PageStatus
              variant="error"
              message="This announcement couldn't be loaded."
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

          {item === null && !isLoading && !isError && (
            <div className="mx-auto max-w-xl rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <Megaphone className="mx-auto text-text-secondary" size={28} aria-hidden="true" />
              <h1 className="mt-3 font-heading text-subtitle text-text-primary">Post not found</h1>
              <p className="mt-1 text-small text-text-secondary">
                This announcement may have been unpublished or the link may be old.
              </p>
              <Button href="/news" variant="secondary" className="mt-5">Back to News</Button>
            </div>
          )}

          {item && (
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-small text-text-secondary">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {CATEGORY_LABELS[item.category]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} aria-hidden="true" />
                  {new Date(item.published_at ?? item.created_at).toLocaleDateString("en-PH", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="mt-4 font-heading text-heading text-text-primary sm:text-hero">
                {item.title}
              </h1>

              {cover && (
                <div className="mt-8 overflow-hidden rounded-xl border border-border">
                  <img src={cover} alt="" className="w-full object-cover" />
                </div>
              )}

              <div className="mt-8 whitespace-pre-wrap text-body leading-relaxed text-text-primary">
                {item.body}
              </div>

              {hasFilipino && (
                <section
                  aria-labelledby="filipino-translation"
                  className="mt-10 rounded-xl border border-border bg-surface p-6"
                >
                  <h2
                    id="filipino-translation"
                    className="flex items-center gap-2 text-small font-semibold uppercase tracking-[0.12em] text-text-secondary"
                  >
                    <Languages size={15} aria-hidden="true" /> Filipino translation
                  </h2>
                  {item.title_fil && (
                    <h3 className="mt-4 font-heading text-subtitle text-text-primary">{item.title_fil}</h3>
                  )}
                  {item.body_fil && (
                    <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-text-primary">
                      {item.body_fil}
                    </p>
                  )}
                </section>
              )}

              <div className="mt-10 border-t border-border pt-6">
                <Button href="/news" variant="secondary">← Back to all announcements</Button>
              </div>
            </div>
          )}
        </Container>
      </article>
    </>
  );
}
