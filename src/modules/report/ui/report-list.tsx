import { Page, PageHeader } from "@/components/page";
import { ViewTabs } from "@/components/view-tabs";
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
  page,
  canImport,
  q,
  state,
  priority,
  scope,
  onlyDoubts,
  validation,
  result,
}: {
  page: ReportPage;
  canImport: boolean;
  q: string;
  state: string;
  priority: string;
  scope: string;
  onlyDoubts: boolean;
  validation: string;
  result: string;
}) {
  function href(value: string) {
    const params = new URLSearchParams({ scope: value });
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (priority) params.set("priority", priority);
    if (validation) params.set("validation", validation);
    return `/signalements?${params}`;
  }

  return (
    <Page className="gap-8 md:gap-8">
      <PageHeader title={onlyDoubts ? "Signalements à vérifier" : "Signalements"} actions={canImport ? <ImportButton /> : null} />
      {result === "validated" || result === "rejected" ? <Alert><AlertTitle>{result === "validated" ? "Signalement validé. Récompense attribuée." : "Signalement écarté."}</AlertTitle></Alert> : null}
      {result === "analyzing" ? <Alert><AlertTitle>Analyse de la pièce demandée.</AlertTitle></Alert> : null}
      <div className="grid gap-5">
        <ViewTabs label="Affectation" items={SCOPES.map((item) => ({ href: href(item.value), label: item.label, active: item.value === scope }))} />
        <QueueFilters q={q} state={state} priority={priority} scope={scope} validation={validation} onlyDoubts={onlyDoubts} />
      </div>
      <ReportsTable page={page} />
    </Page>
  );
}
