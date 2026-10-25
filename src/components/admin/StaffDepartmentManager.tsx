import { useState } from "react";
import { Building2, ChevronDown, ChevronUp, Plus, RotateCcw } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminListSkeleton } from "@/components/admin/AdminStates";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { getErrorMessage } from "@/lib/errors";
import {
  useArchiveStaffDepartment,
  useRestoreStaffDepartment,
  useSaveStaffDepartment,
  useStaffDepartments,
  type StaffDepartment,
} from "@/lib/data/staffDepartments";
import type { StaffCategory, StaffMember } from "@/lib/data/staff";

function memberCount(members: StaffMember[], departmentId: string): number {
  return members.filter((m) => m.department_id === departmentId).length;
}

/**
 * StaffDepartmentManager — add, rename, describe, and archive the
 * departments of ONE staff category tab (JHS learning areas, SHS
 * strands, offices for admins/staff). Members are passed in by the
 * parent (it already fetched them for the list) so the count badge
 * and the archive warning are free — no second query.
 */
export function StaffDepartmentManager({
  category,
  members,
}: {
  category: StaffCategory;
  members: StaffMember[];
}) {
  const { data: departments, isLoading, isError, error } = useStaffDepartments(category);
  const { data: archivedDepartments } = useStaffDepartments(category, true);
  const save = useSaveStaffDepartment();
  const archive = useArchiveStaffDepartment();
  const restore = useRestoreStaffDepartment();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [actionError, setActionError] = useState("");

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setActionError("");
    setAdding(true);
    try {
      await save.mutateAsync({ category, name });
      setNewName("");
    } catch (e) {
      setActionError(getErrorMessage(e, "Couldn't add the department."));
    } finally {
      setAdding(false);
    }
  }

  if (isError) {
    // Pre-migration state — the table doesn't exist yet. A quiet note
    // beats a red error: staff management keeps working untouched.
    return (
      <AdminCard as="section" aria-labelledby="departments-heading" className="mb-5">
        <h2 id="departments-heading" className="text-small font-semibold text-text-primary">Departments</h2>
        <p className="mt-2 text-small text-text-secondary">
          Departments aren't available until the database is updated
          (migration <code className="rounded bg-background px-1">0017_staff_departments.sql</code>).
          Staff management works normally in the meantime.
        </p>
        {error && <p className="mt-1 text-small text-text-secondary">{error.message}</p>}
      </AdminCard>
    );
  }

  return (
    <AdminCard as="section" aria-labelledby="departments-heading" className="mb-5">
      <div className="mb-3">
        <h2 id="departments-heading" className="text-small font-semibold text-text-primary">Departments</h2>
        <p className="mt-1 text-small text-text-secondary">
          Group people under named departments (or offices). They show as expandable cards on the public page.
        </p>
      </div>

      {isLoading && <AdminListSkeleton rows={2} />}

      {!isLoading && (
        <div className="space-y-3">
          {(departments ?? []).map((dept) => (
            <DepartmentRow key={dept.id} department={dept} members={members} />
          ))}

          {departments?.length === 0 && (
            <p className="text-small text-text-secondary">No departments yet — add the first one below.</p>
          )}

          <div className="flex gap-2">
            <label htmlFor={`new-dept-${category}`} className="sr-only">New department name</label>
            <input
              id={`new-dept-${category}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAdd(); } }}
              placeholder="New department name (e.g. Science Department)"
              className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-small focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <AdminButton type="button" onClick={() => void handleAdd()} loading={adding} disabled={!newName.trim()}>
              <Plus size={15} aria-hidden="true" /> Add
            </AdminButton>
          </div>

          {actionError && <p className="text-small text-status-error-text">{actionError}</p>}

          {(archivedDepartments?.length ?? 0) > 0 && (
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-expanded={showArchived}
              >
                {showArchived ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                Archived departments ({archivedDepartments!.length})
              </button>
              {showArchived && (
                <div className="mt-3 space-y-2">
                  {archivedDepartments!.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border px-3 py-2">
                      <span className="text-small text-text-secondary">{dept.name}</span>
                      <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() => restore.mutate({ id: dept.id, name: dept.name })}
                        aria-label={`Restore ${dept.name}`}
                        className="shrink-0 px-2.5 py-1"
                      >
                        <RotateCcw size={13} aria-hidden="true" /> Restore
                      </AdminButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {archive.isError && <p className="text-small text-status-error-text">{getErrorMessage(archive.error, "Couldn't archive the department.")}</p>}
          {save.isError && !adding && <p className="text-small text-status-error-text">{getErrorMessage(save.error, "Couldn't save the department.")}</p>}
        </div>
      )}
    </AdminCard>
  );
}

function DepartmentRow({ department, members }: { department: StaffDepartment; members: StaffMember[] }) {
  const archive = useArchiveStaffDepartment();
  const save = useSaveStaffDepartment();
  const count = memberCount(members, department.id);

  return (
    <ListItemCard
      title={department.name}
      subtitle={department.description || undefined}
      badge={{ label: `${count} member${count === 1 ? "" : "s"}`, variant: "info" }}
      leadingVisual={{ kind: "swatch", color: "#1C3E7C", icon: Building2 }}
      fields={[
        { key: "name", label: "Department name", placeholder: "Department name", initialValue: department.name },
        { key: "description", label: "Description", placeholder: "Short description (optional)", type: "textarea", initialValue: department.description ?? "" },
      ]}
      onSave={async (values) => {
        const name = values.name?.trim();
        if (!name) return { fieldErrors: { name: "Name is required" } };
        try {
          await save.mutateAsync({ id: department.id, category: department.category, name, description: values.description });
        } catch {
          return {};
        }
        return undefined;
      }}
      onDelete={() => archive.mutate({ id: department.id, name: department.name })}
      deleteLabel={`Archive ${department.name}`}
      deleteConfirmMessage={
        count > 0
          ? `Archive ${department.name}? Its ${count} member${count === 1 ? "" : "s"} will show under "Other" on the public page.`
          : `Archive ${department.name}?`
      }
    />
  );
}
