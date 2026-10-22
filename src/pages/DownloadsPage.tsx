import { Download, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { PageStatus } from "@/components/ui/PageStatus";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  DOCUMENT_CATEGORY_LABELS,
  documentFileUrl,
  usePublicDocuments,
  type DocumentCategory,
  type SchoolDocument,
} from "@/lib/data/documents";

const CATEGORY_ORDER: DocumentCategory[] = ["enrollment", "forms", "handbook", "other"];

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsPage() {
  usePageTitle("Downloads");
  const { data: docs, isLoading, isError, refetch } = usePublicDocuments();

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: docs?.filter((d: SchoolDocument) => d.category === cat) ?? [],
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Downloads"
        description="Official school documents — enrollment forms, request forms, and handbooks — ready to download."
        origami="box"
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          {isLoading && <PageStatus variant="loading" message="Loading documents…" />}
          {isError && (
            <PageStatus
              variant="error"
              message="Documents couldn't be loaded right now."
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

          {docs && grouped.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <FileText className="mx-auto text-text-secondary" size={28} aria-hidden="true" />
              <h2 className="mt-3 font-heading text-subtitle text-text-primary">No documents published yet</h2>
              <p className="mx-auto mt-1 max-w-md text-small text-text-secondary">
                School forms and handbooks will be posted here for download. Printed copies are
                always available at the registrar's office.
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <section key={group.category} className="mb-10 last:mb-0" aria-labelledby={`docs-${group.category}`}>
              <h2 id={`docs-${group.category}`} className="mb-4 font-heading text-subtitle text-text-primary">
                {DOCUMENT_CATEGORY_LABELS[group.category]}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.items.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={documentFileUrl(doc.file_path) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-card border border-border bg-surface px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Download size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-semibold text-text-primary group-hover:text-primary">
                          {doc.title}
                        </span>
                        <span className="block truncate text-[12px] text-text-secondary">
                          {doc.description ?? doc.file_name}
                          {doc.file_size ? ` · ${formatSize(doc.file_size)}` : ""}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </section>
    </>
  );
}
