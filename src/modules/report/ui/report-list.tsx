import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportPage } from "@/modules/report/model/report";
import { ImportButton } from "@/modules/report/ui/import-button";
import { QueueFilters } from "@/modules/report/ui/queue-filters";
import { ReportsTable } from "@/modules/report/ui/reports-table";

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
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary">Signalements</h1>
        {canImport ? <ImportButton /> : null}
      </div>
      <QueueFilters q={q} state={state} priority={priority} scope={scope} />
      <Card>
        <CardHeader><CardTitle>File de travail</CardTitle></CardHeader>
        <CardContent><ReportsTable page={page} /></CardContent>
      </Card>
    </section>
  );
}
