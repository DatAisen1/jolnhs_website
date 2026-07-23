import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { news } from "@/data/news";

export function LatestNews() {
  const featured = news.find((article) => article.featured);
  const rest = news.filter((article) => !article.featured);

  return (
    <section className="bg-background py-section-sm md:py-section" aria-labelledby="news-heading">
      <Container>
        <SectionHeading eyebrow="News" title="Latest News" />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {featured && (
            <Card as="article" className="flex flex-col overflow-hidden p-0">
              <ImagePlaceholder
                alt={featured.title}
                label="Featured Article"
                recommendedSize={featured.imageSize}
                className="min-h-[260px] rounded-none border-x-0 border-t-0"
              />
              <div className="flex flex-1 flex-col p-card">
                <div className="flex items-center gap-3 text-small text-text-secondary">
                  <span className="rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary">
                    {featured.category}
                  </span>
                  <span>{featured.date}</span>
                </div>
                <h3 className="mt-4 text-subtitle text-text-primary">
                  {featured.title}
                </h3>
                <p className="mt-3 text-body text-text-secondary">
                  {featured.excerpt}
                </p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((article) => (
              <Card
                as="article"
                key={article.id}
                className="flex gap-4 p-4"
              >
                <ImagePlaceholder
                  alt={article.title}
                  label="News"
                  recommendedSize={article.imageSize}
                  className="min-h-[96px] w-28 shrink-0 rounded-lg p-2"
                />
                <div>
                  <div className="flex items-center gap-2 text-small text-text-secondary">
                    <span className="font-semibold text-primary">
                      {article.category}
                    </span>
                    <span>· {article.date}</span>
                  </div>
                  <h3 className="mt-1 text-body font-semibold text-text-primary">
                    {article.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
