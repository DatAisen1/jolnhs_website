import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionTabs } from "@/components/admin/SectionTabs";
import { CampusLifeSectionPanel } from "@/components/admin/CampusLifeSectionPanel";

const TABS = [
  { slug: "athletes", label: "Athletes" },
  { slug: "pta", label: "PTA" },
  { slug: "journalists", label: "Journalists" },
  { slug: "organizations", label: "Organizations" },
] as const;

export function CampusLifeManagePage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["slug"]>("athletes");
  const [isDirty, setIsDirty] = useState(false);

  function handleTabChange(nextTab: (typeof TABS)[number]["slug"]) {
    if (nextTab === activeTab) return;
    if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    setIsDirty(false);
    setActiveTab(nextTab);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Campus Life"
        description="Edit the organizations, activities, highlights, and officers shown on the public campus life pages."
      />
      <SectionTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      <CampusLifeSectionPanel key={activeTab} slug={activeTab} onDirtyChange={setIsDirty} />
    </div>
  );
}
