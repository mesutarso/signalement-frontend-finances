import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { reportedAtParts, reportTitle, type ReportPage } from "@/modules/report/model/report";
import { workParams, type WorkFilters } from "@/modules/report/model/work-filters";
import { ValidationTag } from "@/modules/report/ui/report-marks";
import { ClickableReportRow } from "@/modules/report/ui/clickable-report-row";

export function ReportsTable({ page, filters }: { page: ReportPage; filters: WorkFilters }) {
  const list=workParams(filters).toString();
  return <div className="grid min-w-0 gap-4">
    <p className="text-sm font-medium">{page.total.toLocaleString("fr-FR")} signalement{page.total > 1 ? "s" : ""}</p>
    <Table aria-label="Liste des signalements">
      <TableHeader><TableRow><TableHead>Signalement</TableHead><TableHead>Établissement / NIF</TableHead><TableHead>Facture</TableHead><TableHead>Statut</TableHead><TableHead>À faire</TableHead><TableHead>Agent</TableHead><TableHead>Reçu le</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
      <TableBody>{page.reports.map(report=>{
        const work=report.work; const date=reportedAtParts(report.reportedAt);
        const title = reportTitle(report.title);
        const href = `/signalements/${report.id}?list=${encodeURIComponent(list)}`;
        return <ClickableReportRow key={report.id}>
          <TableCell className="max-w-64 font-medium whitespace-normal">{title}</TableCell>
          <TableCell className="max-w-52 whitespace-normal"><span className="block">{work?.sellerName || "À compléter"}</span><span className="mt-1 block text-xs text-muted-foreground">{work?.sellerTaxId || "NIF à compléter"}</span></TableCell>
          <TableCell><span className="block">{work?.documentNumber || "À compléter"}</span><span className="mt-1 block text-xs text-muted-foreground">{work?.totalAmount ? `${work.totalAmount} ${work.currency || ""}` : ""}</span></TableCell>
          <TableCell><ValidationTag state={report.validationState} assignmentState={report.state} screeningReason={report.screeningReason} /></TableCell>
          <TableCell className="max-w-64 whitespace-normal text-sm text-muted-foreground">{report.validationState === "doubt" ? work?.photoRequested ? "Nouvelle photo attendue" : work?.reason ?? "Vérifier le dossier" : "—"}</TableCell>
          <TableCell>{report.assigneeName || "Non affecté"}</TableCell>
          <TableCell className="tabular-nums">{date.date}<span className="mt-1 block text-xs text-muted-foreground">{date.time}</span></TableCell>
          <TableCell className="text-right"><Button size="sm" variant="outline" nativeButton={false} render={<Link href={href} />}>
            Voir plus<span className="sr-only"> — {title}</span>
          </Button></TableCell>
        </ClickableReportRow>;
      })}{page.reports.length === 0 ? <TableRow><TableCell colSpan={8}><Empty><EmptyHeader><EmptyTitle>Aucun signalement</EmptyTitle></EmptyHeader></Empty></TableCell></TableRow> : null}</TableBody>
    </Table>
    <TablePagination page={page.page} size={page.size} total={page.total} label="Pagination des signalements" />
  </div>;
}
