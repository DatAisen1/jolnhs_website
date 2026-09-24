import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, UserPlus } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/AdminStates";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { SectionTabs } from "@/components/admin/SectionTabs";
import { StaffFormDrawer } from "@/components/admin/StaffFormDrawer";
import { useArchiveStaffMember, useStaffMembers, type StaffCategory, type StaffMember } from "@/lib/data/staff";
import { getErrorMessage } from "@/lib/errors";
import { AdminListSkeleton } from "@/components/admin/AdminStates";

const TABS = [
  { slug: "administrators", label: "Administrators" },
  { slug: "jhs-faculty", label: "JHS Faculty" },
  { slug: "shs-faculty", label: "SHS Faculty" },
  { slug: "staff", label: "Staff" },
] as const satisfies ReadonlyArray<{ slug: StaffCategory; label: string }>;

type StaffSort = "name-asc" | "name-desc" | "created-desc" | "updated-desc";

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debouncedValue;
}

function buildPublicPhotoUrl(photoPath: string | null) {
  if (!photoPath) return undefined;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/staff-photos/${photoPath}`;
}

function sortMembers(members: StaffMember[], sort: StaffSort) {
  return [...members].sort((left, right) => {
    if (sort === "name-asc") return left.name.localeCompare(right.name);
    if (sort === "name-desc") return right.name.localeCompare(left.name);
    if (sort === "created-desc") return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
  });
}

function StaffList({
  members,
  archived,
  onEdit,
}: {
  members: StaffMember[];
  archived: boolean;
  onEdit: (member: StaffMember) => void;
}) {
  const archiveMember = useArchiveStaffMember();

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            <ListItemCard
              title={member.name}
              subtitle={member.position}
              leadingVisual={{ kind: "photo", photoUrl: buildPublicPhotoUrl(member.photo_path), alt: `Photo for ${member.name}` }}
              fields={[]}
              onDelete={() => archiveMember.mutate(member.id)}
              deleteLabel={`Archive ${member.name}`}
              deleteConfirmMessage={`Archive ${member.name}? This will remove this staff member from the public website. Their record will be preserved.`}
              showDelete={!archived}
            />
          </div>
          {!archived && (
            <AdminButton type="button" variant="secondary" onClick={() => onEdit(member)} aria-label={`Edit ${member.name}`} className="shrink-0 px-3">
              <Pencil size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Edit</span>
            </AdminButton>
          )}
        </div>
      ))}
      {archiveMember.isError && <p className="text-small text-status-error-text">{getErrorMessage(archiveMember.error, "Couldn't archive this staff member.")}</p>}
    </div>
  );
}

export function StaffManagePage() {
  const [activeTab, setActiveTab] = useState<StaffCategory>("administrators");
  const [archived, setArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<StaffSort>("name-asc");
  const [drawerMember, setDrawerMember] = useState<StaffMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading, isError, error, refetch, isFetching } = useStaffMembers(activeTab, archived);

  const filteredMembers = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const matching = (data ?? []).filter((member) => member.name.toLowerCase().includes(query));
    return sortMembers(matching, sort);
  }, [data, debouncedSearch, sort]);

  function openAdd() {
    setDrawerMember(null);
    setDrawerOpen(true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Staff & Faculty"
        description="Manage school personnel and faculty information."
        action={<AdminButton type="button" onClick={openAdd}><UserPlus size={16} aria-hidden="true" />Add Staff</AdminButton>}
      />

      <SectionTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search staff by name</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-small focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>
        <label className="flex items-center gap-2 text-small text-text-secondary">
          <span>Status</span>
          <select value={archived ? "archived" : "active"} onChange={(event) => setArchived(event.target.value === "archived")} className="rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-small text-text-secondary">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as StaffSort)} className="rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="created-desc">Recently added</option>
            <option value="updated-desc">Recently updated</option>
          </select>
        </label>
      </div>

      {isLoading && <AdminListSkeleton />}
      {isError && <AdminErrorState error={error} message="We couldn't load this staff category." onRetry={() => void refetch()} retrying={isFetching} />}
      {!isLoading && !isError && filteredMembers.length === 0 && (
        <AdminEmptyState
          icon={UserPlus}
          title={search ? "No staff members match your search" : `No ${TABS.find((tab) => tab.slug === activeTab)?.label.toLowerCase()} yet`}
          description={search ? "Try a different name or clear the search." : archived ? "Archived staff members will appear here." : "Add the first staff member in this category to begin."}
          action={!archived && !search ? <AdminButton type="button" onClick={openAdd}><UserPlus size={15} aria-hidden="true" />Add Staff</AdminButton> : undefined}
        />
      )}
      {!isLoading && !isError && filteredMembers.length > 0 && <StaffList members={filteredMembers} archived={archived} onEdit={(member) => { setDrawerMember(member); setDrawerOpen(true); }} />}

      {drawerOpen && <StaffFormDrawer member={drawerMember ?? undefined} defaultCategory={activeTab} onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
