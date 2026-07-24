import { HeroBanner } from "@/components/sections/HeroBanner";
import { ProgramSpotlight } from "@/components/sections/ProgramSpotlight";
import { MilestoneSection } from "@/components/sections/MilestoneSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TaglineBanner } from "@/components/sections/TaglineBanner";
import { WelcomeBanner } from "@/components/sections/WelcomeBanner";
import { CampusFacilities } from "@/components/sections/CampusFacilities";
import { MissionStatement } from "@/components/sections/MissionStatement";

/**
 * Thin composition root. HomePage owns ORDER only — every section is a
 * self-contained, independently reusable component with its own data
 * and layout logic. Order:
 * hero (clean, no CTA/stats) -> program spotlight -> milestone
 * -> why choose us -> tagline -> welcome (white/image, breaks up the
 * navy run) -> alternating facility rows -> mission statement (closing
 * "what is JOLNHS" identity block, no CTA — this site is informational).
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
      <MissionStatement />
    </>
  );
}
