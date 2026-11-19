export const WORK_FILTER_KEYS = ["agent", "q", "state", "scope", "validation", "start", "end", "vat", "reading", "missing", "duplicates", "photoRequest", "sort", "page"] as const;
export type WorkFilters = Partial<Record<(typeof WORK_FILTER_KEYS)[number], string>>;
export function workParams(filters: WorkFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of WORK_FILTER_KEYS) if (filters[key]) params.set(key, filters[key]);
  return params;
}
export function listContext(value: string): WorkFilters {
  const params = new URLSearchParams(value);
  return Object.fromEntries(WORK_FILTER_KEYS.map(key => [key, params.get(key) ?? ""])) as WorkFilters;
}
export function listHref(value: string): string {
  const params=workParams(listContext(value));
  return `/signalements${params.size ? `?${params}` : ""}`;
}
