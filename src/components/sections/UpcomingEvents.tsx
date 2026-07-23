import { Calendar, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { events } from "@/data/events";

export function UpcomingEvents() {
  return (
    <section className="bg-white py-section-sm md:py-section" aria-labelledby="events-heading">
      <Container>
        <SectionHeading eyebrow="Calendar" title="Upcoming Events" />

        <ol className="mt-12 flex flex-col gap-0">
          {events.map((event, index) => (
            <li key={event.id} className="relative flex gap-6 pb-10 last:pb-0">
              {/* timeline rail */}
              <div className="flex flex-col items-center">
                <span
                  className="flex h-4 w-4 shrink-0 rounded-full bg-secondary ring-4 ring-primary-50"
                  aria-hidden="true"
                />
                {index !== events.length - 1 && (
                  <span
                    className="mt-1 w-px flex-1 bg-border"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="-mt-1 flex-1 rounded-card border border-border bg-background p-6">
                <h3 className="text-body font-semibold text-text-primary">
                  {event.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-small text-text-secondary">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {event.location}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
