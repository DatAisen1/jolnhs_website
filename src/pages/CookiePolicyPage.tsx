import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cookiePolicy, type CookieRow } from "@/data/cookiePolicy";
import { clearConsent } from "@/lib/consent";

const typeBadge: Record<CookieRow["type"], string> = {
  Essential: "bg-primary-50 text-primary",
  "Third-party": "bg-secondary-50 text-primary-600",
};

/**
 * Cookie Policy — what the site stores in the visitor's browser and why.
 * The "Reset my cookie choice" button clears the saved consent so the
 * banner reappears and the footer map re-blocks.
 */
export function CookiePolicyPage() {
  usePageTitle(cookiePolicy.pageTitle);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    clearConsent();
    setResetDone(true);
  };

  return (
    <>
      <PageHero
        eyebrow={cookiePolicy.eyebrow}
        title={cookiePolicy.pageTitle}
        description={cookiePolicy.description}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: cookiePolicy.pageTitle },
        ]}
      />
      <section className="bg-surface py-section-sm md:py-section">
        <Container className="max-w-3xl">
          <p className="text-small font-semibold uppercase tracking-widest text-text-secondary">
            Last updated: {cookiePolicy.lastUpdated}
          </p>

          {cookiePolicy.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mt-6 text-body text-text-secondary">
              {paragraph}
            </p>
          ))}

          {/* What we store */}
          <h2 className="mt-10 text-subtitle text-text-primary">
            What this site stores
          </h2>
          <div className="mt-4 overflow-x-auto rounded-card border border-border">
            <table className="w-full min-w-[560px] border-collapse text-left text-body">
              <thead>
                <tr className="bg-background text-small font-semibold uppercase tracking-wide text-text-secondary">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cookiePolicy.storageRows.map((row) => (
                  <tr key={row.name} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.purpose}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-small font-semibold ${typeBadge[row.type]}`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cookiePolicy.sections.map((section) => (
            <div key={section.heading} className="mt-10">
              <h2 className="text-subtitle text-text-primary">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="mt-3 text-body text-text-secondary">
                  {paragraph}
                </p>
              ))}

              {section.heading === "Managing or clearing your choice" && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full bg-primary px-5 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Reset my cookie choice
                  </button>
                  {resetDone && (
                    <p role="status" className="mt-2 text-small text-text-secondary">
                      Done — your choice was cleared. The consent banner will
                      appear on your next visit and the footer map is blocked
                      again.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
