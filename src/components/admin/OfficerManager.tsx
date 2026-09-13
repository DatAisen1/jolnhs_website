import { useState } from "react";
import { Plus, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CampusLifeOfficer } from "@/lib/data/campusLife";
import { useSaveOfficer, useArchiveOfficer } from "@/lib/data/campusLife";
import { getErrorMessage } from "@/lib/errors";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { officerNameSchema } from "@/lib/validation/campusLife";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface OfficerManagerProps {
  sectionId: string;
  officers: CampusLifeOfficer[];
}

/** Photo + name + position, with archive (not delete) and replace â€”
 *  built generically enough that Staff & Faculty (Phase 2) can reuse
 *  this same component against the staff_members table instead of a
 *  second near-identical implementation. */
export function OfficerManager({ sectionId, officers }: OfficerManagerProps) {
  const saveOfficer = useSaveOfficer();
  const archiveOfficer = useArchiveOfficer();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Keyed by officer id — this form has no single "Save" button (each field
  // saves independently on blur), so there's no one place to gate a submit;
  // instead each blur handler validates itself and blocks its own save.
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({});

  function handleNameBlur(officer: CampusLifeOfficer, value: string) {
    const result = officerNameSchema.safeParse(value);
    if (!result.success) {
      setNameErrors((prev) => ({ ...prev, [officer.id]: result.error.issues[0].message }));
      return; // don't send an invalid name to the server
    }
    setNameErrors((prev) => {
      const next = { ...prev };
      delete next[officer.id];
      return next;
    });
    saveOfficer.mutate({
      id: officer.id,
      sectionId,
      name: result.data,
      position: officer.position,
      photoPath: officer.photo_path,
    });
  }

  async function handlePhotoUpload(officerId: string, file: File) {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Photo must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photo must be under 2MB.");
      return;
    }

    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    setUploadingId(officerId);
    const ext = file.name.split(".").pop();
    const path = `officers/${officerId}.${ext}`;
    const previousPath = officer.photo_path;

    const { error: uploadError } = await supabase.storage
      .from("staff-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploadingId(null);
      setError("Photo upload failed. Try again.");
      return;
    }

    try {
      await saveOfficer.mutateAsync({
        id: officer.id,
        sectionId,
        name: officer.name,
        position: officer.position,
        photoPath: path,
      });
    } catch {
      // saveOfficer.isError already surfaces this failure to the admin.
      // The new file is uploaded but the officer row doesn't point at it
      // yet — leave both the new file and the old (still-referenced,
      // still-displayed) one alone rather than guessing which to remove.
      setUploadingId(null);
      return;
    }

    setUploadingId(null);

    // Only remove the previous file once the officer row is confirmed to
    // point at the new one — an extension change (e.g. .jpg -> .png)
    // produces a different path, so `upsert` never overwrites it in place
    // and it would otherwise sit in the bucket forever.
    if (previousPath && previousPath !== path) {
      const { error: removeError } = await supabase.storage.from("staff-photos").remove([previousPath]);
      if (removeError) {
        // Non-fatal — the new photo is live and saved regardless. Logged
        // so a recurring cleanup failure is at least visible to a dev,
        // instead of silently accumulating orphans again.
        console.error("Failed to remove previous officer photo:", previousPath, removeError);
      }
    }
  }

  function handleAddOfficer() {
    saveOfficer.mutate({ sectionId, name: "New officer", position: "Position" });
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-small text-red-600">{error}</p>}
      {saveOfficer.isError && (
        <p className="text-small text-red-600">{getErrorMessage(saveOfficer.error, "Couldn't save officer.")}</p>
      )}
      {archiveOfficer.isError && (
        <p className="text-small text-red-600">{getErrorMessage(archiveOfficer.error, "Couldn't archive officer.")}</p>
      )}

      {officers.map((officer) => (
        <div key={officer.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
          <label className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border">
            {officer.photo_path ? (
              <img
                src={supabase.storage.from("staff-photos").getPublicUrl(officer.photo_path).data.publicUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={22} className="text-text-secondary" aria-hidden="true" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhotoUpload(officer.id, file);
              }}
            />
            {uploadingId === officer.id && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] text-text-secondary">
                â€¦
              </span>
            )}
          </label>

          <div className="flex-1 space-y-1.5">
            <input
              defaultValue={officer.name}
              onBlur={(e) => handleNameBlur(officer, e.target.value)}
              aria-invalid={Boolean(nameErrors[officer.id])}
              className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-small font-medium text-text-primary focus:outline-none focus:ring-2 ${
                nameErrors[officer.id]
                  ? "border-status-error focus:ring-status-error"
                  : "border-border focus:ring-primary"
              }`}
            />
            {nameErrors[officer.id] && (
              <p className="text-small text-status-error-text">{nameErrors[officer.id]}</p>
            )}
            <input
              defaultValue={officer.position}
              onBlur={(e) =>
                saveOfficer.mutate({
                  id: officer.id,
                  sectionId,
                  name: officer.name,
                  position: e.target.value,
                  photoPath: officer.photo_path,
                })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-small text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <ConfirmButton
            label={`Archive ${officer.name}`}
            onConfirm={() => archiveOfficer.mutate(officer.id)}
            disabled={archiveOfficer.isPending}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddOfficer}
        disabled={saveOfficer.isPending}
        className="flex items-center gap-1.5 text-small font-medium text-primary hover:text-primary-700 disabled:opacity-50"
      >
        <Plus size={15} />
        {saveOfficer.isPending ? "Adding…" : "Add officer"}
      </button>
    </div>
  );
}