import { Suspense } from "react";
import { Page, PageHeader } from "@/components/page";
import { workParams, type WorkFilters } from "@/modules/report/model/work-filters";
import { reportTitle, type Assignee, type ReportPage } from "@/modules/report/model/report";
import { QueueFilters } from "@/modules/report/ui/queue-filters";
import { ReportsTable, ReportsTableSkeleton } from "@/modules/report/ui/reports-table";
import { Alert, AlertTitle } from "@/components/ui/alert";

export function ReportList({
  page, filters, assignees,
  result,
  validatedOnly = false,
}: {
  page: ReportPage | Promise<ReportPage>;
  filters: WorkFilters;
  assignees: Assignee[] | Promise<Assignee[]>;
  result: string;
  validatedOnly?: boolean;
}) {
  return (
    <Page className="gap-8 md:gap-8">
      <PageHeader title={validatedOnly ? "Dossiers" : "Signalements"} />
      {result === "validated" || result === "rejected" ? <Alert><AlertTitle>{result === "validated" ? "Signalement validé. Récompense attribuée." : "Signalement écarté."}</AlertTitle></Alert> : null}
      {result === "analyzing" ? <Alert><AlertTitle>Analyse de la pièce demandée.</AlertTitle></Alert> : null}
      <QueueFilters filters={filters} assignees={assignees} validatedOnly={validatedOnly} />
      <Suspense key={workParams(filters).toString()} fallback={<ReportsTableSkeleton validatedOnly={validatedOnly} />}>
        <ReportResults page={page} filters={filters} validatedOnly={validatedOnly} />
      </Suspense>
    </Page>
  );
}

async function ReportResults({ page, filters, validatedOnly }: { page: ReportPage | Promise<ReportPage>; filters: WorkFilters; validatedOnly: boolean }) {
  const { reports, page: pageIndex, size, total } = await page;
  const list = encodeURIComponent(workParams({ ...filters, page: pageIndex ? String(pageIndex) : "" }).toString());
  const rows = reports.map(({ id, title, reportedAt, state, validationState, screeningReason, assigneeName, work, reporterName }) => ({
    id,
    title: reportTitle(title),
    href: `/signalements/${id}?list=${list}`,
    reportedAt,
    state,
    validationState,
    screeningReason,
    assigneeName,
    work,
    reporterName: validatedOnly ? null : reporterName,
  }));
  return <ReportsTable rows={rows} pageIndex={pageIndex} pageSize={size} total={total} validatedOnly={validatedOnly} />;
}
