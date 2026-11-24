"use server";

import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { can } from "@/modules/access/model/account";
import { reportTitle } from "@/modules/report/model/report";
import { readReports } from "@/modules/report/queries/read-reports";

export async function findReports(query: string) {
  const value = query.trim();
  if (value.length < 2 || value.length > 80 || !can(await readCurrentAccount(), "report.read")) return null;
  try {
    const { reports, total } = await readReports({ q: value });
    return {
      total,
      reports: reports.map(report => ({
        id: report.id,
        name: report.reporterName,
        title: report.work?.sellerName || reportTitle(report.title, report.identifier),
        date: report.reportedAt,
      })),
    };
  } catch {
    return null;
  }
}
