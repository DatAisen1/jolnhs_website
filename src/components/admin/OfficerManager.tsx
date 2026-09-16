import { useState } from "react";
import { Plus } from "lucide-react";
import { ListItemCard } from "@/pages/admin/ListItemCard";
import { useArchiveOfficer, useSaveOfficer, type CampusLifeOfficer } from "@/lib/data/campusLife";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { officerNameSchema } from "@/lib/validation/campusLife";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { Button } from "@/components/ui/Button";

interface OfficerManagerProps {
  sectionId: string;
  officers: CampusLifeOfficer[];
}

function buildPublicPhotoUrl(photoPath: string | null | undefined) {
  if (!photoPath) return undefined;

  const { data: publicData } = supabase.storage.from("staff-photos").getPublicUrl(photoPath);
  return publicData.publicUrl || undefined;
}

export function OfficerManager({ sectionId, officers }: OfficerManagerProps) {
  const saveOfficer = useSaveOfficer();
  const archiveOfficer = useArchiveOfficer();

  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newNameError, setNewNameError] = useState("");

  function validateName(value: string) {
    const trimmed = value.trim();
    const result = officerNameSchema.safeParse(trimmed);
    if (!result.success) return result.error.issues[0]?.message ?? "Name is required";
    return "";
  }

  async function handleSaveOfficer(values: Record<string, string>) {
    const name = values.name?.trim() ?? "";
    const position = values.position?.trim() ?? "";
    const nameError = validateName(name);
    const fieldErrors: Record<string, string> = {};

    if (nameError) {
      fieldErrors.name = nameError;
    }

    if (!position) {
      fieldErrors.position = "Position is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors };
    }

    const officerId = values.id;
    saveOfficer.mutate(
      {
        id: officerId,
        sectionId,
        name,
        position,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewPosition("");
        },
      }
    );

    return {};
  }

  async function handleAddOfficer() {
    const trimmedName = newName.trim();
    const trimmedPosition = newPosition.trim();
    const nameError = validateName(trimmedName);

    if (nameError) {
      setNewNameError(nameError);
      return;
    }

    setNewNameError("");

    if (!trimmedPosition) {
      setNewNameError("Position is required");
      return;
    }

    saveOfficer.mutate(
      {
        sectionId,
        name: trimmedName,
        position: trimmedPosition,
      },
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
      {officers.length === 0 && (
        <p className="text-small text-text-secondary">No officers yet — add the first one below.</p>
      )}

      <div className="space-y-3">
        {officers.map((officer) => (
          <ListItemCard
            key={officer.id}
            title={officer.name}
            subtitle={officer.position}
            leadingVisual={{
              kind: "photo",
              photoUrl: buildPublicPhotoUrl(officer.photo_path),
              alt: `Photo for ${officer.name}`,
            }}
            fields={[
              { key: "id", label: "Officer ID", placeholder: "", initialValue: officer.id },
              { key: "name", label: "Name", placeholder: "Jane Doe", initialValue: officer.name },
              { key: "position", label: "Position", placeholder: "President", initialValue: officer.position },
            ]}
            onSave={async (values) => {
              const result = await handleSaveOfficer({ ...values, id: officer.id });
              return result;
            }}
            onDelete={() => archiveOfficer.mutate(officer.id)}
            deleteLabel={`Archive ${officer.name}`}
            editLabel={`Edit ${officer.name}`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus size={16} />
          </span>
          <h3 className="text-small font-semibold text-text-primary">Add officer</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="new-officer-name" className="sr-only">
              Officer name
            </label>
            <input
              id="new-officer-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (newNameError) setNewNameError("");
              }}
              placeholder="Name"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {newNameError && <p className="mt-1 text-small text-status-error-text">{newNameError}</p>}
          </div>
          <div>
            <label htmlFor="new-officer-position" className="sr-only">
              Officer position
            </label>
            <input
              id="new-officer-position"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Position"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => void handleAddOfficer()}
              disabled={saveOfficer.isPending}
              className="px-4 py-2 text-small"
            >
              {saveOfficer.isPending ? "Saving…" : "Add officer"}
            </Button>
            {saveOfficer.isError && (
              <InlineNotice
                variant="error"
                message={getErrorMessage(saveOfficer.error, "Couldn't save this officer.")}
              />
            )}
            {archiveOfficer.isError && (
              <InlineNotice
                variant="error"
                message={getErrorMessage(archiveOfficer.error, "Couldn't archive this officer.")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
