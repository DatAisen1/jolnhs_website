import { useState } from "react";
import { useSaveStaffMember, type StaffCategory, type StaffMember } from "@/lib/data/staff";
import { supabase } from "@/lib/supabase";
import { staffSchema, type StaffFormValues } from "@/lib/validation/staffSchema";

const EMPTY_VALUES: StaffFormValues = {
  name: "",
  position: "",
  category: "administrators",
  department: "",
};

export function useStaffForm(member?: StaffMember, onSuccess?: () => void) {
  const saveMember = useSaveStaffMember();
  const [values, setValues] = useState<StaffFormValues>(() => ({
    ...EMPTY_VALUES,
    name: member?.name ?? "",
    position: member?.position ?? "",
    category: member?.category ?? "administrators",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormValues, string>>>({});

  function updateValue<Key extends keyof StaffFormValues>(key: Key, value: StaffFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit() {
    const result = staffSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof StaffFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof StaffFormValues;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return false;
    }

    setErrors({});
    let photoPath = member?.photo_path ?? null;
    if (result.data.photo) {
      const extension = result.data.photo.name.split(".").pop()?.toLowerCase() ?? "webp";
      photoPath = `staff/${member?.id ?? crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("staff-photos").upload(photoPath, result.data.photo, {
        upsert: true,
        contentType: result.data.photo.type,
      });
      if (error) throw error;
    }

    await saveMember.mutateAsync({
      id: member?.id,
      name: result.data.name,
      position: result.data.position,
      category: result.data.category as StaffCategory,
      photoPath,
    });
    onSuccess?.();
    return true;
  }

  return {
    values,
    errors,
    updateValue,
    submit,
    isPending: saveMember.isPending,
    error: saveMember.error,
  };
}
