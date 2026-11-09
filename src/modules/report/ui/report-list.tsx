import { Page, PageHeader } from "@/components/page";
import { ViewTabs } from "@/components/view-tabs";
import type { ReportPage } from "@/modules/report/model/report";
import { ImportButton } from "@/modules/report/ui/import-button";
import { QueueFilters } from "@/modules/report/ui/queue-filters";
import { ReportsTable } from "@/modules/report/ui/reports-table";

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
}: {
  page: ReportPage;
  canImport: boolean;
  q: string;
  state: string;
  priority: string;
  scope: string;
}) {
  function href(value: string) {
    const params = new URLSearchParams({ scope: value });
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (priority) params.set("priority", priority);
    return `/signalements?${params}`;
  }

  return (
    <Page className="gap-8 md:gap-8">
      <PageHeader title="Signalements" actions={canImport ? <ImportButton /> : null} />
      <div className="grid gap-5">
        <ViewTabs label="Affectation" items={SCOPES.map((item) => ({ href: href(item.value), label: item.label, active: item.value === scope }))} />
        <QueueFilters q={q} state={state} priority={priority} scope={scope} />
      </div>
      <ReportsTable page={page} />
    </Page>
  );
}
