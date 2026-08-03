  import { MapPin, Mail, FacebookIcon, Clock } from "lucide-react";
  import { Container } from "@/components/ui/Container";
  import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
  import { SchoolBadge } from "@/components/ui/SchoolBadge";
  import { officeHours } from "@/data/officeHours";

  /**
   * White-background footer with the school's two badges (crest + DepEd
   * seal) and name centered/left, an address + office hours + map grid, and
   * a slim copyright bar — mirrors the reference's footer structure exactly.
   */
  export function Footer() {
    return (
      <footer className="bg-white text-text-secondary">
        <Container className="grid grid-cols-1 gap-10 py-14 md:grid-cols-[auto_1fr_1fr]">
          {/* Badges + school name */}
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
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
              <br></br>National High School
            </p>
          </div>


          {/* Address + office hours */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-small font-semibold uppercase tracking-widest text-primary">
                Address
              </p>
              <ul className="mt-4 flex flex-col gap-2 text-body">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>Sagaba, Santo Domingo Nueva Ecija, Philippines</span>
                </li>
                <li className="flex items-center gap-2">
                  <FacebookIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>jolnhs300814official</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>julia.ortiz1945@gmail.com</span>
                </li>
              </ul>
            </div>

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

          {/* Map */}
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
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
