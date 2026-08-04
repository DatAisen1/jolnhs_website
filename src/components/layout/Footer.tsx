import { MapPin, Mail, FacebookIcon, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SchoolBadge } from "@/components/ui/SchoolBadge";
import { officeHours } from "@/data/officeHours";
import { navigation } from "@/data/navigation";
import { tagline } from "@/data/tagline";
import { schoolContact } from "@/data/schoolContact";

// Reuses the header's nav data (same labels/hrefs the top nav uses) plus
// two routes that exist (see App.tsx) but aren't in the main nav —
// Enroll and Contact both deserve a footer link even though they don't
// need a full dropdown menu of their own.
const footerQuickLinks = [
  ...navigation.map(({ label, href }) => ({ label, href })),
  { label: "Enroll Now", href: "/enroll" },
  { label: "Contact Us", href: "/contact" },
];

const focusRing =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * White-background footer: school identity + tagline, quick links to
 * every section, address/email/social/hours, and a map with a
 * "Get Directions" link — followed by a slim copyright bar.
 */
export function Footer() {
  return (
    <footer className="bg-white text-text-secondary">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">
          {/* Identity: badges, school name, tagline */}
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div className="flex gap-3">
              <SchoolBadge
                label="JO"
                ariaLabel="JOLNHS crest"
                size={56}
                src="/images/logo-jolnhs.png"
              />
              <SchoolBadge
                label="DepEd"
                ariaLabel="DepEd seal"
                tone="primary-600"
                size={56}
                src="/images/logo-deped.png"
              />
            </div>

            <p className="text-small font-bold uppercase tracking-wide text-primary">
              Julia Ortiz Luis
              <br />
              National High School
            </p>
            <p className="max-w-[220px] text-small italic text-text-secondary">
              {tagline.heading}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer">
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Quick Links
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`transition-colors hover:text-primary ${focusRing}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Address + social + email */}
          <div>
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Address
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={schoolContact.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors hover:text-primary ${focusRing}`}
                >
                  {schoolContact.address}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FacebookIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={schoolContact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="JOLNHS on Facebook"
                  className={`transition-colors hover:text-primary ${focusRing}`}
                >
                  {schoolContact.facebookHandle}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a
                  href={`mailto:${schoolContact.email}`}
                  className={`transition-colors hover:text-primary ${focusRing}`}
                >
                  {schoolContact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Office Hours
            </p>
            <dl className="mt-4 flex flex-col gap-2 text-body">
              {officeHours.map((item) => (
                <div key={item.day} className="flex items-start gap-2">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold">{item.day}</dt>
                    <dd className="text-text-secondary">{item.hours}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Map — full width so a 300px-tall embed isn't squeezed into a
            narrow grid column. The "Get Directions" link gives
            screen-reader and no-JS visitors a real way to act on this,
            not just an inert iframe. */}
        <div className="mt-10 overflow-hidden rounded-xl border border-border shadow-sm">
          <iframe
            title="Julia Ortiz Luis National High School Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.8384851614747!2d120.8768644!3d15.6002918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396d56bc6c4569f%3A0x38a58219fbe28103!2sJulia%20Ortiz%20Luis%20National%20High%20School!5e0!3m2!1sen!2sus!4v1784873839872"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border bg-background px-4 py-3 text-small">
            <span className="text-text-secondary">View on Google Maps</span>
            <a
              href={schoolContact.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`whitespace-nowrap font-semibold text-primary hover:underline ${focusRing}`}
            >
              Get Directions →
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-4">
        <Container className="text-center text-small">
          &copy; {new Date().getFullYear()} Julia Ortiz Luis National High School. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}