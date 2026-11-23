import { can } from "@/modules/access/model/account";
import { redirect } from "next/navigation";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { readReports } from "@/modules/report/queries/read-reports";
import { WORK_FILTER_KEYS, type WorkFilters } from "@/modules/report/model/work-filters";
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
  const requestedPage = Number(params.page ?? 0);
  const q = first(params.q).trim();
  const state = first(params.state);
  const agentQueue = account.role === "AGENT" && !validatedOnly;
  const validation = validatedOnly ? "validated"
    : agentQueue && params.validation === undefined ? "doubt" : first(params.validation);
  const requestedScope = first(params.scope);
  const scope = requestedScope || (agentQueue && validation === "doubt" ? "mine" : "all");
  const filters: WorkFilters = Object.fromEntries(WORK_FILTER_KEYS.map(key => [key, first(params[key]) ]));
  filters.scope=scope; filters.validation=validation;
  const assignee = first(params.agent);
  const [assignees, page] = await Promise.all([readAssignees(), readReports({
    ...filters,
    page: Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0,
    q,
    state,
    validation,
    assigneeId: scope === "mine" ? account.id : assignee || undefined,
    unassigned: scope === "unassigned",
  })]);
  return (
    <ReportList
      page={page}
      filters={filters}
      assignees={assignees}
      agent={assignee}
      canImport={can(account, "import.run")}
      onlyDoubts={agentQueue}
      validatedOnly={validatedOnly}
      validation={validation}
      result={first(params.result)}
      q={q}
      state={state}
      scope={scope}
    />
  );
}
