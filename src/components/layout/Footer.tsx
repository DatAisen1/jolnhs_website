import { MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const quickLinks = [
  { label: "Maps & Location", href: "/visit" },
  { label: "Contact us", href: "/contact" },
  { label: "Directory", href: "/directory" },
  { label: "Jobs", href: "/jobs" },
];

/**
 * White-background footer with the school's two badges (crest + DepEd
 * seal) and name centered/left, an address + quick-links + map grid, and
 * a slim copyright bar — mirrors the reference's footer structure exactly.
 */
export function Footer() {
  return (
    <footer className="bg-white text-text-secondary">
      <Container className="grid grid-cols-1 gap-10 py-14 md:grid-cols-[auto_1fr_1fr]">
        {/* Badges + school name */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="flex gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-small font-bold text-primary"
              role="img"
              aria-label="JOLNHS crest placeholder"
            >
              JO
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary-600 text-small font-bold text-primary-600"
              role="img"
              aria-label="DepEd seal placeholder"
            >
              DepEd
            </div>
          </div>
          <p className="text-small font-bold uppercase tracking-wide text-primary">
            Julia Ortiz Luis National High School
          </p>
        </div>

        {/* Address + quick links */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Address
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Julia Ortiz Luis St., City Proper, Nueva Ecija, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>(044) 000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>info@jolnhs.edu.ph</span>
              </li>
            </ul>
          </div>

          <nav aria-label="Footer quick links">
            <p className="text-small font-semibold uppercase tracking-widest text-primary">
              Quick Links
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-body">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Map */}
        <div>
          <ImagePlaceholder
            alt="Map showing JOLNHS location"
            label="Insert Google Map Here"
            recommendedSize="400 x 300"
            className="min-h-[160px]"
          />
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
