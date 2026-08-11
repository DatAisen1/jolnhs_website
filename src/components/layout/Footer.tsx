import { MapPin, Mail, FacebookIcon, Clock } from "lucide-react";
import type { ReactNode } from "react";
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

// Focus ring tuned for the dark navy footer background — the site-wide
// blue focus outline (see index.css) still applies, but this adds an
// offset visible against `bg-primary-700` specifically, where a
// primary-colored ring would nearly disappear into the background.
const focusRing =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * IconBadge
 *
 * Wraps a lucide icon in the same circular-badge treatment used
 * elsewhere in the app (see CampusLifeCard) — a bare icon next to text
 * reads as unfinished; a badged icon reads as a deliberate list marker.
 * Local to Footer since nothing else currently needs this exact
 * dark-background variant (white/10 fill, secondary-light icon).
 */
function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
      {children}
    </span>
  );
}

/**
 * Dark navy footer (bg-primary-700, matching the header's own darkest
 * tier) with a 3px brand-gradient top edge, badged icons throughout, and
 * a slim copyright bar below.
 *
 * WHY DARK, NOT WHITE: a white footer sitting directly under a white
 * page body (or under a colored CTA band with no transition) reads as
 * "the page ran out," not "the page ended." A confident dark closing
 * band — the same treatment government/school portals like this one's
 * own inspiration reference use — gives the page a deliberate stopping
 * point and enough contrast to read as premium rather than incidental.
 */
export function Footer() {
  return (
    <footer className="bg-primary-700 text-secondary-100">
      {/* Brand edge: a slim gradient strip using the SAME primary tonal
          scale as everything else (no new colors introduced) — a small
          detail that signals intentional design rather than a plain
          rule/border. */}
      <div aria-hidden="true" className="h-[3px] w-full bg-gradient-to-r from-primary-400 via-secondary-300 to-primary-400" />

      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr]">
          {/* Identity: badges, school name, tagline */}
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left lg:pr-8 lg:border-r lg:border-white/10">
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

            <p className="text-small font-bold uppercase tracking-wide text-white">
              Julia Ortiz Luis
              <br />
              National High School
            </p>
            <p className="max-w-[220px] text-small italic text-secondary-100">
              {tagline.heading}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer">
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Quick Links
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Address + social + email */}
          <div>
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Address
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-body">
              <li className="flex items-start gap-3">
                <IconBadge>
                  <MapPin className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <a
                  href={schoolContact.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`pt-1 text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                >
                  {schoolContact.address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge>
                  <FacebookIcon className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <a
                  href={schoolContact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="JOLNHS on Facebook"
                  className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                >
                  {schoolContact.facebookHandle}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge>
                  <Mail className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <a
                  href={`mailto:${schoolContact.email}`}
                  className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                >
                  {schoolContact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Office Hours
            </p>
            <dl className="mt-4 flex flex-col gap-3 text-body">
              {officeHours.map((item) => (
                <div key={item.day} className="flex items-start gap-3">
                  <IconBadge>
                    <Clock className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                  </IconBadge>
                  <div className="pt-1">
                    <dt className="font-semibold text-white">{item.day}</dt>
                    <dd className="text-secondary-100">{item.hours}</dd>
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
        <div className="mt-10 overflow-hidden rounded-xl border border-white/10 shadow-lg">
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
          <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-primary-800 px-4 py-3 text-small">
            <span className="text-secondary-100">View on Google Maps</span>
            <a
              href={schoolContact.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`whitespace-nowrap font-semibold text-secondary-300 hover:text-white hover:underline ${focusRing}`}
            >
              Get Directions →
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4">
        <Container className="text-center text-small text-secondary-100">
          &copy; {new Date().getFullYear()} Julia Ortiz Luis National High School. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}