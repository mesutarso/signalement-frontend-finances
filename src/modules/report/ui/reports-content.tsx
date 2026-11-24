import { can } from "@/modules/access/model/account";
import { redirect } from "next/navigation";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readReports } from "@/modules/report/queries/read-reports";
import { pageIndex } from "@/modules/report/model/administration";
import { normalizeReportStatusFilter } from "@/modules/report/model/assessment";
import { SIGNAL_FILTER_KEYS, WORK_FILTER_KEYS, type WorkFilters } from "@/modules/report/model/work-filters";
import { readAssignees } from "@/modules/report/queries/read-assignees";
import { ReportList } from "@/modules/report/ui/report-list";

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function ReportsContent({ searchParams, validatedOnly = false }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  validatedOnly?: boolean;
}) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "report.read")) redirect("/");
  const params = await searchParams;
  const q = first(params.q).trim();
  const validation = validatedOnly ? "validated" : normalizeReportStatusFilter(first(params.validation));
  const scope = validatedOnly ? first(params.scope) || "all" : "";
  const keys = validatedOnly ? WORK_FILTER_KEYS : SIGNAL_FILTER_KEYS;
  const filters: WorkFilters = {
    ...Object.fromEntries(keys.map((key) => [key, first(params[key])])),
    q,
    scope,
    validation,
    origin: !validatedOnly && validation === "validated" ? "signalements" : "",
  };
  const assignee = first(params.agent);
  const assignees = readAssignees();
  const page = readReports({
    ...filters,
    page: pageIndex(params.page),
    validation: validation || "all",
    assigneeId: scope === "mine" ? account.id : assignee || undefined,
    unassigned: scope === "unassigned",
  });
  const [agents, resultPage] = validatedOnly ? await Promise.all([assignees, page]) : [assignees, page];
  return (
    <ReportList
      page={resultPage}
      filters={filters}
      assignees={agents}
      validatedOnly={validatedOnly}
      result={first(params.result)}
    />
  );
}
