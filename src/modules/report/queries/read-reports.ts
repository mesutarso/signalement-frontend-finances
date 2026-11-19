import { readJson } from "@/lib/api";
import type { ReportPage } from "@/modules/report/model/report";

export type ReportFilters = {
  page?: number;
  q?: string;
  state?: string;
  validation?: string;
  assigneeId?: string;
  unassigned?: boolean;
  start?: string; end?: string; vat?: string; reading?: string; missing?: string;
  duplicates?: string; photoRequest?: string; sort?: string;
};

export async function readReports(filters: ReportFilters = {}): Promise<ReportPage> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page ?? 0));
  params.set("size", "20");
  if (filters.q) params.set("q", filters.q);
  if (filters.state) params.set("state", filters.state);
  if (filters.validation) params.set("validation", filters.validation);
  if (filters.unassigned) params.set("unassigned", "true");
  else if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
  for (const key of ["start", "end", "vat", "reading", "missing", "duplicates", "photoRequest", "sort"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  return readJson<ReportPage>(`/api/reports?${params}`);
}
