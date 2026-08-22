import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CampusLifeOfficer } from "@/lib/data/campusLife";
import { useSaveOfficer, useArchiveOfficer } from "@/lib/data/campusLife";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface OfficerManagerProps {
  sectionId: string;
  officers: CampusLifeOfficer[];
}

/** Photo + name + position, with archive (not delete) and replace —
 *  built generically enough that Staff & Faculty (Phase 2) can reuse
 *  this same component against the staff_members table instead of a
 *  second near-identical implementation. */
export function OfficerManager({ sectionId, officers }: OfficerManagerProps) {
  const saveOfficer = useSaveOfficer();
  const archiveOfficer = useArchiveOfficer();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    setUploadingId(officerId);
    const ext = file.name.split(".").pop();
    const path = `officers/${officerId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("staff-photos")
      .upload(path, file, { upsert: true });

    setUploadingId(null);
    if (uploadError) {
      setError("Photo upload failed. Try again.");
      return;
    }

    const officer = officers.find((o) => o.id === officerId);
    if (officer) {
      saveOfficer.mutate({
        id: officer.id,
        sectionId,
        name: officer.name,
        position: officer.position,
        photoPath: path,
      });
    }
  }

  function handleAddOfficer() {
    saveOfficer.mutate({ sectionId, name: "New officer", position: "Position" });
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-small text-red-600">{error}</p>}

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
                …
              </span>
            )}
          </label>

          <div className="flex-1 space-y-1.5">
            <input
              defaultValue={officer.name}
              onBlur={(e) =>
                saveOfficer.mutate({
                  id: officer.id,
                  sectionId,
                  name: e.target.value,
                  position: officer.position,
                  photoPath: officer.photo_path,
                })
              }
              className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-small font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
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

          <button
            type="button"
            onClick={() => archiveOfficer.mutate(officer.id)}
            aria-label={`Archive ${officer.name}`}
            className="text-text-secondary hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddOfficer}
        className="flex items-center gap-1.5 text-small font-medium text-primary hover:text-primary-700"
      >
        <Plus size={15} />
        Add officer
      </button>
    </div>
  );
}