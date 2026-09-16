import { useState } from "react";
import { Plus } from "lucide-react";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { useArchiveStaffMember, useSaveStaffMember, type StaffCategory, type StaffMember } from "@/lib/data/staff";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { staffNameSchema, staffPositionSchema } from "@/lib/validation/staff";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Button } from "@/components/ui/Button";

interface StaffMemberManagerProps {
  /** Which tab this instance belongs to — every add/edit here is pinned
   *  to this category; it's never a user-editable field (matches how
   *  OfficerManager pins `sectionId` rather than exposing it in the form). */
  category: StaffCategory;
  members: StaffMember[];
}

function buildPublicPhotoUrl(photoPath: string | null | undefined) {
  if (!photoPath) return undefined;

  const { data: publicData } = supabase.storage.from("staff-photos").getPublicUrl(photoPath);
  return publicData.publicUrl || undefined;
}

/**
 * Per-category list manager for Staff & Faculty (P1.11). Structurally the
 * same component as `OfficerManager` — list of `ListItemCard`s plus an
 * "Add" form at the bottom — because the interaction pattern the task
 * calls for (add/edit/archive) IS the officer pattern; the only real
 * difference is the data hooks underneath (P1.12: plain upsert instead
 * of a section-save RPC, since staff rows have no child tables).
 */
export function StaffMemberManager({ category, members }: StaffMemberManagerProps) {
  const saveMember = useSaveStaffMember();
  const archiveMember = useArchiveStaffMember();

  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newNameError, setNewNameError] = useState("");
  const [newPositionError, setNewPositionError] = useState("");

  function validateName(value: string) {
    const result = staffNameSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Name is required";
  }

  function validatePosition(value: string) {
    const result = staffPositionSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message ?? "Position is required";
  }

  async function handleSaveMember(values: Record<string, string>) {
    const name = values.name?.trim() ?? "";
    const position = values.position?.trim() ?? "";
    const fieldErrors: Record<string, string> = {};

    const nameError = validateName(name);
    if (nameError) fieldErrors.name = nameError;

    const positionError = validatePosition(position);
    if (positionError) fieldErrors.position = positionError;

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors };
    }

    saveMember.mutate({
      id: values.id,
      name,
      position,
      category,
    });

    return {};
  }

  async function handleAddMember() {
    const trimmedName = newName.trim();
    const trimmedPosition = newPosition.trim();
    const nameError = validateName(trimmedName);
    const positionError = validatePosition(trimmedPosition);

    setNewNameError(nameError);
    setNewPositionError(positionError);
    if (nameError || positionError) return;

    saveMember.mutate(
      { name: trimmedName, position: trimmedPosition, category },
      {
        onSuccess: () => {
          setNewName("");
          setNewPosition("");
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      {members.length === 0 && (
        <p className="text-small text-text-secondary">No staff members yet — add the first one below.</p>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <ListItemCard
            key={member.id}
            title={member.name}
            subtitle={member.position}
            leadingVisual={{
              kind: "photo",
              photoUrl: buildPublicPhotoUrl(member.photo_path),
              alt: `Photo for ${member.name}`,
            }}
            fields={[
              { key: "id", label: "Staff ID", placeholder: "", initialValue: member.id },
              { key: "name", label: "Name", placeholder: "Jane Doe", initialValue: member.name },
              { key: "position", label: "Position", placeholder: "Principal", initialValue: member.position },
            ]}
            onSave={async (values) => {
              const result = await handleSaveMember({ ...values, id: member.id });
              return result;
            }}
            onDelete={() => archiveMember.mutate(member.id)}
            deleteLabel={`Archive ${member.name}`}
            editLabel={`Edit ${member.name}`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus size={16} />
          </span>
          <h3 className="text-small font-semibold text-text-primary">Add staff member</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="new-staff-name" className="sr-only">
              Staff member name
            </label>
            <input
              id="new-staff-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (newNameError) setNewNameError("");
              }}
              placeholder="Name"
              aria-invalid={Boolean(newNameError)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {newNameError && <p className="mt-1 text-small text-status-error-text">{newNameError}</p>}
          </div>
          <div>
            <label htmlFor="new-staff-position" className="sr-only">
              Staff member position
            </label>
            <input
              id="new-staff-position"
              value={newPosition}
              onChange={(e) => {
                setNewPosition(e.target.value);
                if (newPositionError) setNewPositionError("");
              }}
              placeholder="Position"
              aria-invalid={Boolean(newPositionError)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {newPositionError && <p className="mt-1 text-small text-status-error-text">{newPositionError}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => void handleAddMember()}
              disabled={saveMember.isPending}
              className="px-4 py-2 text-small"
            >
              {saveMember.isPending ? "Saving…" : "Add staff member"}
            </Button>
            {saveMember.isError && (
              <InlineNotice
                variant="error"
                message={getErrorMessage(saveMember.error, "Couldn't save this staff member.")}
              />
            )}
            {archiveMember.isError && (
              <InlineNotice
                variant="error"
                message={getErrorMessage(archiveMember.error, "Couldn't archive this staff member.")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}