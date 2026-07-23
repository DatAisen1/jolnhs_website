import { HeroBanner } from "@/components/sections/HeroBanner";
import { ProgramSpotlight } from "@/components/sections/ProgramSpotlight";
import { MilestoneSection } from "@/components/sections/MilestoneSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TaglineBanner } from "@/components/sections/TaglineBanner";
import { WelcomeBanner } from "@/components/sections/WelcomeBanner";
import { CampusFacilities } from "@/components/sections/CampusFacilities";
import { EnrollmentCTA } from "@/components/sections/EnrollmentCTA";

/**
 * Thin composition root. HomePage owns ORDER only — every section is a
 * self-contained, independently reusable component with its own data
 * and layout logic. Order mirrors the reference layout:
 * hero -> program spotlight -> milestone -> why choose us -> tagline
 * -> welcome -> alternating facility rows -> enrollment CTA.
 */
export function HomePage() {
  return (
    <>
      <HeroBanner />
      <ProgramSpotlight />
      <MilestoneSection />
      <WhyChooseUs />
      <TaglineBanner />
      <WelcomeBanner />
      <CampusFacilities />
      <EnrollmentCTA />
    </>
  );
}
