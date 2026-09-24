import { useState } from "react";
import { useSaveOfficer, type CampusLifeOfficer } from "@/lib/data/campusLife";
import { supabase } from "@/lib/supabase";
import { officerSchema, type OfficerFormValues } from "@/lib/validation/officerSchema";

export function useOfficerForm(sectionId: string, officer?: CampusLifeOfficer, onSuccess?: () => void) {
  const saveOfficer = useSaveOfficer();
  const [values, setValues] = useState<OfficerFormValues>({
    name: officer?.name ?? "",
    position: officer?.position ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OfficerFormValues, string>>>({});

  function updateValue<Key extends keyof OfficerFormValues>(key: Key, value: OfficerFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit() {
    const result = officerSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof OfficerFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof OfficerFormValues;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return false;
    }

    setErrors({});
    let photoPath = officer?.photo_path ?? null;
    if (result.data.photo) {
      const extension = result.data.photo.name.split(".").pop()?.toLowerCase() ?? "webp";
      photoPath = `staff/${officer?.id ?? crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("staff-photos").upload(photoPath, result.data.photo, {
        upsert: true,
        contentType: result.data.photo.type,
      });
      if (error) throw error;
    }

    await saveOfficer.mutateAsync({
      id: officer?.id,
      sectionId,
      name: result.data.name,
      position: result.data.position,
      photoPath,
    });
    onSuccess?.();
    return true;
  }

  return { values, errors, updateValue, submit, isPending: saveOfficer.isPending, error: saveOfficer.error };
}
