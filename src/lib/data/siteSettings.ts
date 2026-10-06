import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updated_at: string;
}

/**
 * Fetches all site settings from Supabase.
 * Used by Header, Footer, and contact areas to display site-wide information.
 */
export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSetting[]> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Helper to get a single setting value from the settings array.
 * Returns null if the setting is not found.
 */
export function getSettingValue(settings: SiteSetting[], key: string): string | null {
  const setting = settings.find((s) => s.key === key);
  return setting?.value ?? null;
}

/**
 * Parse office hours string from site_settings into the array format expected by Footer.
 * Expected format: "Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed"
 */
export function parseOfficeHours(officeHoursString: string | null): Array<{ day: string; hours: string }> {
  if (!officeHoursString) {
    return [
      { day: "Monday–Friday", hours: "Closed" },
      { day: "Saturday", hours: "Closed" },
      { day: "Sunday", hours: "Closed" },
      { day: "Holidays", hours: "Closed" },
    ];
  }

  // Split by comma to get individual day/hour pairs
  const entries = officeHoursString.split(",").map((entry) => entry.trim());
  
  return entries.map((entry) => {
    // Split by the first colon to separate day from hours
    const colonIndex = entry.indexOf(":");
    if (colonIndex === -1) {
      return { day: entry, hours: "" };
    }
    const day = entry.substring(0, colonIndex).trim();
    const hours = entry.substring(colonIndex + 1).trim();
    return { day, hours };
  });
}
