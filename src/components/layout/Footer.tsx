import { Link } from "react-router-dom";
import { MapPin, Mail, FacebookIcon, Clock, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ConsentGatedMap } from "@/components/privacy/ConsentGatedMap";
import { SchoolBadge } from "@/components/ui/SchoolBadge";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { tagline } from "@/data/tagline";
import { useSiteSettings, getSettingValue, parseOfficeHours } from "@/lib/data/siteSettings";

// Footer links are grouped by VISITOR INTENT, not by mirroring the
// header — the header already does "browse the site"; the footer is
// where people look for a specific destination (enroll, a form, the
// staff list) after scrolling to the bottom.
const exploreLinks = [
  { label: "About JOLNHS", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Campus Life", href: "/campus-life" },
  { label: "Budget Transparency", href: "/budget" },
  { label: "News", href: "/news" },
];

const resourceLinks = [
  { label: "Enroll", href: "/enroll" },
  { label: "Downloads & Forms", href: "/downloads" },
  { label: "Faculty & Staff", href: "/about/faculty-staff" },
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
  const { data: siteSettings = [] } = useSiteSettings();
  const shouldReduceMotion = useReducedMotion();
  
  // Extract commonly used settings (use the same keys as admin)
  const address = getSettingValue(siteSettings, "address");
  const email = getSettingValue(siteSettings, "email");
  const facebookHandle = getSettingValue(siteSettings, "facebook_handle");
  const facebookUrl = getSettingValue(siteSettings, "facebook_url");
  const mapsUrl = getSettingValue(siteSettings, "maps_url");
  const officeHoursString = getSettingValue(siteSettings, "office_hours");
  const siteTagline = getSettingValue(siteSettings, "site_tagline") || tagline.heading;
  
  // Parse office hours into array format
  const officeHours = officeHoursString ? parseOfficeHours(officeHoursString) : [
    { day: "Monday–Friday", hours: "Closed" },
    { day: "Saturday", hours: "Closed" },
    { day: "Sunday", hours: "Closed" },
    { day: "Holidays", hours: "Closed" },
  ];

  return (
    <footer className="bg-primary-700 text-secondary-100">
      {/* Brand edge: a slim gradient strip using the SAME primary tonal
          scale as everything else (no new colors introduced) — a small
          detail that signals intentional design rather than a plain
          rule/border. */}
      <div aria-hidden="true" className="h-[3px] w-full bg-gradient-to-r from-primary-400 via-secondary-300 to-primary-400" />

      <Container className="py-14">
        {/* Columns stagger in on first scroll-into-view — the footer is
            the last thing a visitor sees, so the quiet reveal gives the
            page a finished "closing credits" feel instead of a hard cut. */}
        <motion.div
          variants={staggerContainer}
          initial={shouldReduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]"
        >
          {/* Identity: badges, school name, tagline, social */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left lg:pr-8">
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
            <p className="max-w-[240px] text-small italic text-secondary-100">
              {siteTagline}
            </p>
            <a
              href={facebookUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="JOLNHS on Facebook"
              className={`mt-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-small text-secondary-100 transition-colors hover:bg-white/15 hover:text-white ${focusRing}`}
            >
              <FacebookIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {facebookHandle || "Facebook"}
            </a>
          </motion.div>

          {/* Explore — the site's main sections */}
          <motion.nav variants={fadeUp} aria-label="Explore">
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Explore
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Resources — the destinations people come to the footer for */}
          <motion.nav variants={fadeUp} aria-label="Resources">
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Resources
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Visit — contact + condensed hours */}
          <motion.div variants={fadeUp}>
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Visit Us
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-body">
              <li className="flex items-start gap-3">
                <IconBadge>
                  <MapPin className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <a
                  href={mapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`pt-1 text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                >
                  {address || "Address not configured"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge>
                  <Mail className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <a
                  href={email ? `mailto:${email}` : "#"}
                  className={`text-secondary-100 transition-colors hover:text-white ${focusRing}`}
                >
                  {email || "Email not configured"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <IconBadge>
                  <Clock className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                </IconBadge>
                <div className="pt-1 text-secondary-100">
                  {officeHours[0] && (
                    <p>
                      <span className="font-semibold text-white">{officeHours[0].day}</span>
                      {" · "}
                      {officeHours[0].hours}
                    </p>
                  )}
                  {officeHours.length > 1 && officeHours.slice(1).every((h) => /closed/i.test(h.hours)) ? (
                    <p className="mt-0.5 text-small">Closed on weekends & holidays</p>
                  ) : (
                    officeHours.slice(1).map((item) => (
                      <p key={item.day} className="mt-0.5 text-small">
                        {item.day} · {item.hours}
                      </p>
                    ))
                  )}
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Map + enrollment CTA — the footer's last conversion chance.
            Map keeps its consent gate; the Enroll card balances the row
            so the map isn't a full-width dead strip. */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
            <ConsentGatedMap />
            <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-primary-800 px-4 py-3 text-small">
              <span className="text-secondary-100">View on Google Maps</span>
              <a
                href={mapsUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`whitespace-nowrap font-semibold text-secondary-300 hover:text-white hover:underline ${focusRing}`}
              >
                Get Directions →
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-primary-800 p-6 lg:p-8">
            <p className="text-small font-semibold uppercase tracking-widest text-secondary-300">
              Admissions
            </p>
            <h3 className="mt-2 font-heading text-subtitle text-white">
              Ready to become a Jolian?
            </h3>
            <p className="mt-2 text-small text-secondary-100">
              See the requirements, enrollment steps, and downloadable forms —
              everything you need in one place.
            </p>
            <div className="mt-5 flex flex-col items-start gap-3">
              <Link
                to="/enroll"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-small font-semibold text-primary-700 transition-colors hover:bg-secondary-50"
              >
                Enrollment guide →
              </Link>
              <Link
                to="/downloads"
                className={`text-small text-secondary-300 transition-colors hover:text-white hover:underline ${focusRing}`}
              >
                Downloads & forms
              </Link>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4">
        <Container className="flex flex-col items-center gap-2 text-center text-small text-secondary-100 sm:flex-row sm:justify-between sm:text-left">
          <span>
            &copy; {new Date().getFullYear()} Julia Ortiz Luis National High School. All rights reserved.
          </span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link
              to="/privacy-policy"
              className={`transition-colors hover:text-white ${focusRing}`}
            >
              Data Privacy
            </Link>
            <Link
              to="/cookie-policy"
              className={`transition-colors hover:text-white ${focusRing}`}
            >
              Cookies
            </Link>
            <Link
              to="/admin/login"
              rel="nofollow"
              className={`inline-flex items-center gap-1.5 transition-colors hover:text-white ${focusRing}`}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Admin Login
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}