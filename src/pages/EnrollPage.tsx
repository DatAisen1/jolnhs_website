import { CalendarCheck, ClipboardList, Download, GraduationCap, HelpCircle, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getSettingValue, useSiteSettings } from "@/lib/data/siteSettings";
import { usePublicDocuments, documentFileUrl } from "@/lib/data/documents";

const REQUIREMENTS = [
  {
    title: "Incoming Grade 7 & Transferees",
    items: [
      "Report Card (Form 138) from the previous school",
      "PSA Birth Certificate (photocopy)",
      "Certificate of Good Moral Character",
      "Two (2) recent 1×1 ID photos",
      "Barangay Certificate of Residency (if applicable)",
    ],
  },
  {
    title: "Senior High School (Grade 11)",
    items: [
      "Report Card (Form 138) — Grade 10 completion",
      "PSA Birth Certificate (photocopy)",
      "Certificate of Good Moral Character",
      "Two (2) recent 1×1 ID photos",
      "ESC/QVR voucher documents (if applicable)",
    ],
  },
];

const STEPS = [
  {
    step: "Step 1",
    title: "Prepare your documents",
    body: "Gather the requirements for your incoming level listed below. Forms are available at the registrar's office or on the Downloads page.",
  },
  {
    step: "Step 2",
    title: "Visit the registrar's office",
    body: "Submit your documents in person during office hours. A parent or guardian should accompany minors.",
  },
  {
    step: "Step 3",
    title: "Confirm your section & schedule",
    body: "Once processed, the registrar will confirm your program placement, section assignment, and class schedule.",
  },
];

export function EnrollPage() {
  usePageTitle("Enroll");
  const { data: settings } = useSiteSettings();
  const { data: documents } = usePublicDocuments();
  const email = getSettingValue(settings ?? [], "email");
  const officeHours = getSettingValue(settings ?? [], "office_hours");

  const enrollmentDocs = documents?.filter((d) => d.category === "enrollment") ?? [];

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Enroll at JOLNHS"
        description="Everything you need to join Julia Ortiz Luis National High School — requirements, steps, and where to get help."
        watermarkIcon={GraduationCap}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Enroll" }]} />

      {/* Steps */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-small font-semibold uppercase tracking-[0.16em] text-primary">
              <ClipboardList size={16} aria-hidden="true" /> How enrollment works
            </p>
            <h2 className="font-heading text-heading text-text-primary">Three steps to become a Jolian</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.step}
                className="rounded-card border border-border bg-surface p-6 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-small font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-heading text-subtitle text-text-primary">{s.title}</h3>
                <p className="mt-2 text-small leading-relaxed text-text-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Requirements */}
      <section className="bg-surface py-section-sm md:py-section">
        <Container>
          <h2 className="mb-2 font-heading text-heading text-text-primary">Requirements checklist</h2>
          <p className="mb-10 max-w-2xl text-body text-text-secondary">
            Bring original documents for verification plus one photocopy of each. Incomplete
            requirements may delay processing.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {REQUIREMENTS.map((group) => (
              <div key={group.title} className="rounded-card border border-border bg-background p-6">
                <h3 className="mb-4 font-heading text-subtitle text-text-primary">{group.title}</h3>
                <ul className="space-y-3">
                  {group.items.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-small text-text-primary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-card border border-primary/20 bg-primary/5 px-5 py-4">
            <CalendarCheck className="shrink-0 text-primary" size={20} aria-hidden="true" />
            <p className="text-small text-text-primary">
              <span className="font-semibold">Office hours for enrollment:</span>{" "}
              {officeHours ?? "Monday–Friday, 7:00 AM – 5:00 PM"}. Early registration
              typically opens before each school year — watch the News page for dates.
            </p>
          </div>
        </Container>
      </section>

      {/* Downloads + help */}
      <section className="bg-background py-section-sm md:py-section">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mb-5 flex items-center gap-2 font-heading text-subtitle text-text-primary">
                <Download size={20} className="text-primary" aria-hidden="true" /> Enrollment forms
              </h2>
              {enrollmentDocs.length > 0 ? (
                <ul className="space-y-3">
                  {enrollmentDocs.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={documentFileUrl(doc.file_path) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 transition-colors hover:bg-background"
                      >
                        <Download size={16} className="shrink-0 text-primary" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-small font-semibold text-text-primary">{doc.title}</span>
                          {doc.description && (
                            <span className="block truncate text-[12px] text-text-secondary">{doc.description}</span>
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-card border border-dashed border-border bg-surface px-5 py-6 text-small text-text-secondary">
                  Enrollment forms are available at the registrar's office and will be posted here for download.
                </p>
              )}
              <Button href="/downloads" variant="secondary" className="mt-5">
                Browse all documents
              </Button>
            </div>

            <div>
              <h2 className="mb-5 flex items-center gap-2 font-heading text-subtitle text-text-primary">
                <HelpCircle size={20} className="text-primary" aria-hidden="true" /> Questions?
              </h2>
              <p className="text-small leading-relaxed text-text-secondary">
                For program placement, transferee evaluation, or special-program admission
                (STE, SP-ICT), contact the school — the registrar and program coordinators
                answer inquiries during office hours.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {email && (
                  <Button href={`mailto:${email}`} variant="secondary">
                    <Mail size={15} aria-hidden="true" /> Email the school
                  </Button>
                )}
                <Button href="/contact">Contact page</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
