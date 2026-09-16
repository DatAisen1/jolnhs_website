import { useState } from "react";
import { useStaffMembers, type StaffCategory } from "@/lib/data/staff";
import { getErrorMessage } from "@/lib/errors";
import { StaffMemberManager } from "@/components/admin/StaffMemberManager";
import { SectionTabs } from "@/components/admin/SectionTabs";
import { InlineNotice } from "@/components/ui/InlineNotice";

// Labels match the public site's `staffCategories` in
// src/data/facultyStaff.ts (minus its synthetic "all" tab) and the
// `staff_members.category` check constraint — these three lists must stay
// in sync since together they define what a "category" is app-wide.
const TABS = [
  { slug: "administrators", label: "Administrators" },
  { slug: "jhs-faculty", label: "JHS Faculty" },
  { slug: "shs-faculty", label: "SHS Faculty" },
  { slug: "staff", label: "Staff" },
] as const satisfies ReadonlyArray<{ slug: StaffCategory; label: string }>;

function CategoryPanel({ category }: { category: StaffCategory }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useStaffMembers(category);

  if (isLoading) return <p className="text-small text-text-secondary">Loading…</p>;

  if (isError || !data) {
    return (
      <InlineNotice
        variant="error"
        title="Couldn't load this category"
        message={getErrorMessage(error, "Something went wrong talking to the database.")}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  return <StaffMemberManager category={category} members={data} />;
}

export function StaffManagePage() {
  const [activeTab, setActiveTab] = useState<StaffCategory>("administrators");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-heading text-subtitle text-text-primary">Staff & Faculty</h1>

      <SectionTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Unlike CampusLifeManagePage, this page has no isDirty/unsaved-
          changes guard on tab switching. Every StaffMemberManager edit
          saves immediately through its own ListItemCard Save click
          (P1.12's direct-upsert mutation) — there's no page-level draft
          state living outside the cards that a tab switch could ever
          discard, so the guard CampusLifeManagePage needs for its
          buffered form fields doesn't apply here. */}
      <CategoryPanel key={activeTab} category={activeTab} />
    </div>
  );
}