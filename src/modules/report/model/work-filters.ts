import { normalizeReportStatusFilter } from "@/modules/report/model/assessment";

export const WORK_FILTER_KEYS = ["agent", "q", "state", "scope", "validation", "start", "end", "vat", "reading", "missing", "duplicates", "photoRequest", "sort", "page", "origin"] as const;
export const SIGNAL_FILTER_KEYS = ["agent", "q", "validation", "start", "end", "sort", "page", "reading"] as const;
export type WorkFilters = Partial<Record<(typeof WORK_FILTER_KEYS)[number], string>>;
export function workParams(filters: WorkFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of WORK_FILTER_KEYS) if (filters[key]) params.set(key, filters[key]);
  return params;
}
export function listContext(value: string): WorkFilters {
  const params = new URLSearchParams(value);
  const keys = isDossierList(params) ? WORK_FILTER_KEYS : [...SIGNAL_FILTER_KEYS, "origin"] as const;
  const filters: WorkFilters = Object.fromEntries(keys.map(key => [key, params.get(key) ?? ""]));
  filters.validation = normalizeReportStatusFilter(filters.validation ?? "");
  return filters;
}

function isDossierList(params: URLSearchParams) {
  return params.get("validation") === "validated" && params.get("origin") !== "signalements";
}

export function listHref(value: string): string {
  const params = workParams(listContext(value));
  const path = isDossierList(params) ? "/dossiers-valides" : "/signalements";
  params.delete("origin");
  if (path === "/dossiers-valides") params.delete("validation");
  return `${path}${params.size ? `?${params}` : ""}`;
}
