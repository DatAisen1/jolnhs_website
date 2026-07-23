import { HeroBanner } from "@/components/sections/HeroBanner";
import { AcademicPrograms } from "@/components/sections/AcademicPrograms";
import { AboutSection } from "@/components/sections/AboutSection";
import { PrincipalsMessage } from "@/components/sections/PrincipalsMessage";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { CampusFacilities } from "@/components/sections/CampusFacilities";
import { LatestNews } from "@/components/sections/LatestNews";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { SchoolStatistics } from "@/components/sections/SchoolStatistics";
import { EnrollmentCTA } from "@/components/sections/EnrollmentCTA";

/**
 * Thin composition root. HomePage owns ORDER only — every section is a
 * self-contained, independently reusable component with its own data
 * and layout logic. This keeps the page trivially reorderable and keeps
 * diffs small when one section changes.
 */
export function HomePage() {
  return (
    <>
      <HeroBanner />
      <AcademicPrograms />
      <AboutSection />
      <PrincipalsMessage />
      <WhyChooseUs />
      <CampusFacilities />
      <LatestNews />
      <UpcomingEvents />
      <SchoolStatistics />
      <EnrollmentCTA />
    </>
  );
}
