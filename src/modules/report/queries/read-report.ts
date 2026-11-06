import { readMissingJson } from "@/lib/api";
import type { ReportDetail } from "@/modules/report/model/report";

export async function readReport(id: string): Promise<ReportDetail | null> {
  return readMissingJson<ReportDetail>(`/api/reports/${id}`);
}
