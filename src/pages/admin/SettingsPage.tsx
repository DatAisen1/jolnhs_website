import { useState } from "react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";
import { settingsSchema, type SettingsFormValues } from "@/lib/validation/settingsSchema";

// Map database keys to form field names
const SETTINGS_KEYS = {
  site_name: "site_name",
  site_tagline: "site_tagline",
  address: "address",
  email: "email",
  facebook_handle: "facebook_handle",
  facebook_url: "facebook_url",
  maps_url: "maps_url",
  school_type: "school_type",
  department: "department",
  programs_offered: "programs_offered",
  mission_statement: "mission_statement",
  office_hours: "office_hours",
} as const;

function SettingsForm({ initialValues, onSave, isSaving, saveError, showSuccess }: {
  initialValues: SettingsFormValues;
  onSave: (values: SettingsFormValues) => void;
  isSaving: boolean;
  saveError: string | null;
  showSuccess: boolean;
}) {
  const [values, setValues] = useState<SettingsFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof SettingsFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all settings
    const result = settingsSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSave(result.data);
  };

  const renderTextField = (key: keyof SettingsFormValues, label: string, type: "text" | "email" | "url" = "text", multiline = false) => (
    <div key={key}>
      <label htmlFor={key} className="block text-small font-medium text-text-primary mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={key}
          value={values[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
          rows={3}
        />
      ) : (
        <input
          id={key}
          type={type}
          value={values[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-small text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
      {errors[key] && (
        <p className="mt-1 text-small text-status-error-text">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveError && (
        <div className="flex items-center gap-2 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{saveError}</span>
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 rounded-md border border-status-success bg-status-success-bg px-4 py-3 text-small text-status-success-text">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Identity Section */}
      <AdminCard>
        <h3 className="text-subtitle font-semibold text-text-primary mb-4">Site Identity</h3>
        <div className="space-y-4">
          {renderTextField("site_name", "Site Name")}
          {renderTextField("site_tagline", "Tagline")}
        </div>
      </AdminCard>

      {/* Contact Section */}
      <AdminCard>
        <h3 className="text-subtitle font-semibold text-text-primary mb-4">Contact Information</h3>
        <div className="space-y-4">
          {renderTextField("address", "Address")}
          {renderTextField("email", "Email", "email")}
          {renderTextField("facebook_handle", "Facebook Handle")}
          {renderTextField("facebook_url", "Facebook URL", "url")}
          {renderTextField("maps_url", "Google Maps URL", "url")}
        </div>
      </AdminCard>

      {/* Information Section */}
      <AdminCard>
        <h3 className="text-subtitle font-semibold text-text-primary mb-4">School Information</h3>
        <div className="space-y-4">
          {renderTextField("school_type", "School Type")}
          {renderTextField("department", "Department")}
          {renderTextField("programs_offered", "Programs Offered")}
          {renderTextField("mission_statement", "Mission Statement", "text", true)}
          {renderTextField("office_hours", "Office Hours")}
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <AdminButton type="submit" disabled={isSaving}>
          <Save size={16} aria-hidden="true" />
          {isSaving ? "Saving..." : "Save Changes"}
        </AdminButton>
      </div>
    </form>
  );
}

export function SettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      const updates = Object.entries(SETTINGS_KEYS).map(([dbKey, formKey]) => ({
        key: dbKey,
        value: values[formKey as keyof SettingsFormValues] || "",
      }));

      // Update all settings in a single transaction
      const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (values: SettingsFormValues) => {
    saveMutation.mutate(values, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
    });
  };

  // Convert database rows to form values
  const initialValues: SettingsFormValues = Object.values(SETTINGS_KEYS).reduce((acc, formKey) => {
    const setting = settings?.find((s) => s.key === Object.keys(SETTINGS_KEYS).find((k) => SETTINGS_KEYS[k as keyof typeof SETTINGS_KEYS] === formKey));
    acc[formKey as keyof SettingsFormValues] = setting?.value || "";
    return acc;
  }, {} as SettingsFormValues);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader title="Settings" description="Manage site-wide configuration." />
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg bg-border" />
          <div className="h-48 animate-pulse rounded-lg bg-border" />
          <div className="h-48 animate-pulse rounded-lg bg-border" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl">
        <AdminPageHeader title="Settings" description="Manage site-wide configuration." />
        <div className="flex items-center gap-2 rounded-md border border-status-error bg-status-error-bg px-4 py-3 text-small text-status-error-text">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{getErrorMessage(error, "Failed to load settings.")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Settings" description="Manage site-wide configuration." />
      <SettingsForm
        initialValues={initialValues}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        saveError={saveMutation.error ? getErrorMessage(saveMutation.error, "Failed to save settings.") : null}
        showSuccess={showSuccess}
      />
    </div>
  );
}
