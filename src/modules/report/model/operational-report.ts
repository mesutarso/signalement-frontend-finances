const FILTERS = ["from", "to", "service", "finding", "company", "status"] as const;
type ReportFilter = (typeof FILTERS)[number];

export const OPERATIONAL_STATUSES = {
  validated: "Validé",
  rejected: "Rejeté",
  duplicate: "Doublon",
  untreated: "Non traité",
  doubt: "À vérifier",
} as const;

export type OperationalReportRow = {
  id: string;
  receivedAt: string;
  company: string | null;
  taxId: string | null;
  service: string | null;
  status: keyof typeof OPERATIONAL_STATUSES;
  finding: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  amount: string | null;
  currency: string | null;
};

export type OperationalReportOptions = { services: string[]; findings: string[] };

export function operationalReportQuery(get: (key: ReportFilter) => unknown): URLSearchParams {
  const query = new URLSearchParams();
  for (const key of FILTERS) {
    const value = get(key);
    if (typeof value === "string" && value.trim()) query.set(key, value.trim());
  }
  if (!query.has("status")) query.set("status", "validated");
  return query;
}
