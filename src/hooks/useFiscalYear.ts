import { useFiscalYears, type FiscalYear } from "@/lib/data/budget";

export function useFiscalYear(id: string | null): { data: FiscalYear | null; isLoading: boolean } {
  const query = useFiscalYears();
  return {
    data: id ? query.data?.find((year) => year.id === id) ?? null : null,
    isLoading: query.isLoading,
  };
}
