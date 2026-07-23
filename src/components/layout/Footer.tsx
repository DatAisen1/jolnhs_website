import { Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const quickLinks = [
  { label: "About JOLNHS", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Campus Life", href: "/campus-life" },
  { label: "Budget Transparency", href: "/budget" },
  { label: "Enrollment", href: "/enroll" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-blue-100">
      <Container className="grid grid-cols-1 gap-12 py-section-sm md:grid-cols-4">
        {/* School information */}
        <div className="md:col-span-1">
          <h3 className="text-subtitle text-white">
            Julia Ortiz Luis National High School
          </h3>
          <p className="mt-3 text-small">
            Committed to quality, inclusive, and community-centered public
            education.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              aria-label="JOLNHS on Facebook"
              className="rounded-full border border-blue-300/40 p-2 transition-colors hover:bg-white hover:text-primary"
            >
              <Facebook className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#"
              aria-label="JOLNHS on YouTube"
              className="rounded-full border border-blue-300/40 p-2 transition-colors hover:bg-white hover:text-primary"
            >
              <Youtube className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer quick links">
          <h3 className="text-small font-semibold uppercase tracking-widest text-blue-200">
            Quick Links
          </h3>
          <ul className="mt-4 flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-body transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="text-small font-semibold uppercase tracking-widest text-blue-200">
            Contact
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-body">
            <li className="flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Julia Ortiz Luis St., City Proper, Philippines</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>(044) 000-0000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>info@jolnhs.edu.ph</span>
            </li>
          </ul>
        </div>

        {/* Map */}
        <div>
          <h3 className="text-small font-semibold uppercase tracking-widest text-blue-200">
            Find Us
          </h3>
          <div className="mt-4">
            <ImagePlaceholder
              alt="Map showing JOLNHS location"
              label="Insert Google Map Here"
              recommendedSize="400 x 300"
              className="min-h-[160px] border-blue-300/40 bg-primary-600/40 text-blue-100"
            />
          </div>
        </div>
      </Container>

      <div className="border-t border-blue-300/20 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-small sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Julia Ortiz Luis National High School. All rights reserved.</p>
          <p>Department of Education — Republic of the Philippines</p>
        </Container>
      </div>
    </footer>
  );
}
