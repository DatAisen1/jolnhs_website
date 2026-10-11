import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getSettingValue, parseOfficeHours, useSiteSettings } from "@/lib/data/siteSettings";

const REQUIRED_INFORMATION = "Requires school-provided information";

function isHttpsUrl(value: string | null): value is string {
  if (!value || !/^https:\/\//i.test(value)) return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const contactLinkClass =
  "break-words text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function ContactPage() {
  usePageTitle("Contact Us");

  const { data, isLoading, isError } = useSiteSettings();
  const settings = data ?? [];
  const address = getSettingValue(settings, "address");
  const email = getSettingValue(settings, "email");
  const facebookHandle = getSettingValue(settings, "facebook_handle");
  const facebookUrl = getSettingValue(settings, "facebook_url");
  const mapsUrl = getSettingValue(settings, "maps_url");
  const officeHours = getSettingValue(settings, "office_hours");

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        description="Reach Julia Ortiz Luis National High School for inquiries, concerns, or visits."
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />
      <section className="bg-white py-section-sm md:py-section">
        <Container>
          {isLoading ? (
            <p role="status" className="mt-8 text-body text-text-secondary">
              Loading contact information...
            </p>
          ) : isError ? (
            <div role="alert" className="mt-8 border-l-4 border-primary px-5 py-3">
              <h2 className="text-section font-semibold text-text-primary">
                Contact information unavailable
              </h2>
              <p className="mt-2 text-body text-text-secondary">
                Contact details could not be loaded.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
              <section aria-labelledby="contact-details-heading">
                <h2 id="contact-details-heading" className="text-section font-semibold text-text-primary">
                  School contact details
                </h2>
                <dl className="mt-6 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-6 text-body">
                  <dt className="font-semibold text-text-primary">Address</dt>
                  <dd className="break-words text-text-secondary">
                    {address || REQUIRED_INFORMATION}
                  </dd>

                  <dt className="font-semibold text-text-primary">Email</dt>
                  <dd>
                    {email ? (
                      <a href={`mailto:${email}`} className={contactLinkClass}>
                        {email}
                      </a>
                    ) : (
                      <span className="text-text-secondary">{REQUIRED_INFORMATION}</span>
                    )}
                  </dd>

                  <dt className="font-semibold text-text-primary">Phone</dt>
                  <dd className="break-words text-text-secondary">{REQUIRED_INFORMATION}</dd>

                  <dt className="font-semibold text-text-primary">Facebook</dt>
                  <dd>
                    {facebookHandle && isHttpsUrl(facebookUrl) ? (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={contactLinkClass}
                      >
                        {facebookHandle}
                      </a>
                    ) : (
                      <span className="break-words text-text-secondary">
                        {facebookHandle || REQUIRED_INFORMATION}
                      </span>
                    )}
                  </dd>

                  <dt className="font-semibold text-text-primary">Directions</dt>
                  <dd>
                    {isHttpsUrl(mapsUrl) ? (
                      <Button href={mapsUrl} variant="secondary" className="px-5 py-2">
                        Get directions
                      </Button>
                    ) : (
                      <span className="text-text-secondary">{REQUIRED_INFORMATION}</span>
                    )}
                  </dd>
                </dl>
              </section>

              <section aria-labelledby="office-hours-heading">
                <h2 id="office-hours-heading" className="text-section font-semibold text-text-primary">
                  Office hours
                </h2>
                {officeHours ? (
                  <dl className="mt-6 flex flex-col gap-5 text-body">
                    {parseOfficeHours(officeHours).map((item, index) => (
                      <div key={`${item.day}-${index}`}>
                        <dt className="font-semibold text-text-primary">{item.day}</dt>
                        <dd className="text-text-secondary">{item.hours}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-6 text-body text-text-secondary">{REQUIRED_INFORMATION}</p>
                )}
              </section>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}