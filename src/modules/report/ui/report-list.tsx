import { Page, PageHeader } from "@/components/page";
import { ViewTabs } from "@/components/view-tabs";
import { workParams, type WorkFilters } from "@/modules/report/model/work-filters";
import type { Assignee } from "@/modules/report/model/report";
import type { ReportPage } from "@/modules/report/model/report";
import { ImportButton } from "@/modules/report/ui/import-button";
import { QueueFilters } from "@/modules/report/ui/queue-filters";
import { ReportsTable } from "@/modules/report/ui/reports-table";
import { Alert, AlertTitle } from "@/components/ui/alert";

const SCOPES = [
  { value: "all", label: "Tous" },
  { value: "mine", label: "Les miens" },
  { value: "unassigned", label: "Non affectés" },
];

export function ReportList({
  page, filters, assignees, agent,
  canImport,
  q,
  state,
  scope,
  onlyDoubts,
  validation,
  result,
}: {
  page: ReportPage; filters: WorkFilters; assignees: Assignee[]; agent: string;
  canImport: boolean;
  q: string;
  state: string;
  scope: string;
  onlyDoubts: boolean;
  validation: string;
  result: string;
}) {
  function href(value: string) {
    const params = workParams({...filters, scope: value, page: ""});
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (validation) params.set("validation", validation);
    return `/signalements?${params}`;
  }

  return (
    <Page className="gap-8 md:gap-8">
      <PageHeader title={onlyDoubts && validation === "doubt" ? "Signalements à vérifier" : "Signalements"} actions={canImport ? <ImportButton /> : null} />
      {result === "validated" || result === "rejected" ? <Alert><AlertTitle>{result === "validated" ? "Signalement validé. Récompense attribuée." : "Signalement écarté."}</AlertTitle></Alert> : null}
      {result === "analyzing" ? <Alert><AlertTitle>Analyse de la pièce demandée.</AlertTitle></Alert> : null}
      <div className="grid gap-5">
        <ViewTabs label="Affectation" items={SCOPES.map((item) => ({ href: href(item.value), label: item.label, active: item.value === scope }))} />
        <QueueFilters filters={filters} assignees={assignees} agent={agent} />
      </div>
      <ReportsTable page={page} filters={filters} />
    </Page>
  );
}
