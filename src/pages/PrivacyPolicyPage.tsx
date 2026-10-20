import { Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { privacyPolicy } from "@/data/privacyPolicy";
import { getSettingValue, useSiteSettings } from "@/lib/data/siteSettings";

/**
 * Data Privacy Notice — RA 10173 (Data Privacy Act of 2012) notice for
 * the personal data published on this site (staff listings, student
 * officers, photos) plus data-subject rights and the DPO contact.
 * All copy lives in data/privacyPolicy.ts so wording stays editable
 * without touching this file.
 */
export function PrivacyPolicyPage() {
  usePageTitle(privacyPolicy.pageTitle);
  const { data: settings = [] } = useSiteSettings();
  const dpoEmail = getSettingValue(settings, "email");

  return (
    <>
      <PageHero
        eyebrow={privacyPolicy.eyebrow}
        title={privacyPolicy.pageTitle}
        description={privacyPolicy.description}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: privacyPolicy.pageTitle },
        ]}
      />
      <section className="bg-surface py-section-sm md:py-section">
        <Container className="max-w-3xl">
          <p className="text-small font-semibold uppercase tracking-widest text-text-secondary">
            Last updated: {privacyPolicy.lastUpdated}
          </p>

          <div className="mt-10 flex flex-col gap-10">
            {privacyPolicy.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-subtitle text-text-primary">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mt-3 text-body text-text-secondary">
                    {paragraph}
                  </p>
                ))}
                {section.items && (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-text-secondary">
                    {section.items.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                )}

                {/* The DPO section renders the school's configured email
                    inline so visitors can act on it immediately. */}
                {section.heading === "Contact our Data Protection Officer" && (
                  <p className="mt-3 flex items-center gap-2 text-body">
                    <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {dpoEmail ? (
                      <a
                        href={`mailto:${dpoEmail}`}
                        className="font-semibold text-primary underline underline-offset-4 hover:text-primary-600"
                      >
                        {dpoEmail}
                      </a>
                    ) : (
                      <span className="text-text-secondary">
                        School email address — see our Contact page
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
