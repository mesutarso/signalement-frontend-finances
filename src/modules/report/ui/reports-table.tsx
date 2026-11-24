"use client";

import Link from "next/link";
import { createColumnHelper, rowPaginationFeature, tableFeatures, useTable } from "@tanstack/react-table";
import { TablePagination } from "@/components/table-pagination";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { REJECTION_REASONS, UNREADABLE_MESSAGE } from "@/modules/report/model/assessment";
import { findingLabel, formatDeclarantName, reportedAtParts, type ReportSummary } from "@/modules/report/model/report";
import { ClickableReportRow } from "@/modules/report/ui/clickable-report-row";
import { ValidationTag } from "@/modules/report/ui/report-marks";

type ReportRow = Pick<ReportSummary,
  "id" | "work" | "state" | "validationState" | "screeningReason" | "assigneeName" | "reportedAt" | "reporterName"
> & { title: string; href: string };

const features = tableFeatures({ rowPaginationFeature });
const column = createColumnHelper<typeof features, ReportRow>();
const reportIdentification = column.columns([
  column.accessor("title", { header: "Signalement" }),
  column.display({
    id: "seller",
    header: "Établissement / NIF",
    cell: ({ row: { original: { work } } }) => <>
      <span className="block">{work?.sellerName || "À compléter"}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{work?.sellerTaxId || "NIF à compléter"}</span>
    </>,
  }),
]);

const statusColumn = column.display({
  id: "status",
  header: "Statut",
  cell: ({ row: { original: report } }) => (
    <ValidationTag state={report.validationState} assignmentState={report.state} screeningReason={report.screeningReason} />
  ),
});

const decisionColumn = column.display({
  id: "decision",
  header: "Catégorie / motif",
  cell: ({ row: { original: { work, validationState, screeningReason } } }) => {
    const reason = work?.reason?.trim();
    const finding = findingLabel(work?.finding ?? null);
    const rejection = work?.rejectionReason?.trim();
    if (validationState === "rejected" || rejection) {
      if (screeningReason === "duplicate") return REJECTION_REASONS.duplicate;
      const recorded = rejection || reason;
      if (screeningReason === "unreadable" || recorded === UNREADABLE_MESSAGE) return REJECTION_REASONS.unreadable;
      return recorded || "Motif de rejet non renseigné";
    }
    if (finding) return finding;
    switch (validationState) {
      case "validated": return reason || "Catégorie non renseignée";
      case "doubt": return work?.photoRequested ? "Nouvelle photo attendue" : reason || "À vérifier par l’agent";
      case "analyzing": return "Analyse des pièces en cours";
      case "queued": return "En attente d’analyse";
      default: return "Décision non renseignée";
    }
  },
});

const reportTracking = column.columns([
  column.accessor("assigneeName", {
    header: "Agent",
    cell: ({ getValue }) => getValue() || "Non affecté",
  }),
  column.accessor("reportedAt", {
    header: "Reçu le",
    cell: ({ getValue }) => {
      const { date, time } = reportedAtParts(getValue());
      return <>{date}<span className="mt-1 block text-xs text-muted-foreground">{time}</span></>;
    },
  }),
  column.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row: { original: { href, title } } }) => (
      <Button size="sm" variant="default" nativeButton={false} render={<Link href={href} />}>
        Voir plus<span className="sr-only"> — {title}</span>
      </Button>
    ),
  }),
]);

const signalementColumns = column.columns([
  ...reportIdentification,
  column.accessor("reporterName", {
    header: "Nom du déclarant",
    cell: ({ getValue }) => formatDeclarantName(getValue()) ?? "—",
  }),
  statusColumn,
  decisionColumn,
  ...reportTracking,
]);

const dossierColumns = column.columns([
  ...reportIdentification,
  column.display({
    id: "invoice",
    header: "Facture",
    cell: ({ row: { original: { work } } }) => <>
      <span className="block">{work?.documentNumber || "À compléter"}</span>
      {work?.totalAmount ? <span className="mt-1 block text-xs text-muted-foreground">{work.totalAmount} {work.currency}</span> : null}
    </>,
  }),
  statusColumn,
  decisionColumn,
  ...reportTracking,
]);

const cellClasses: Record<string, string> = {
  title: "max-w-64 font-medium whitespace-normal",
  seller: "max-w-52 whitespace-normal",
  reporterName: "max-w-52 whitespace-normal break-words",
  decision: "min-w-40 max-w-64 break-words whitespace-normal",
  reportedAt: "tabular-nums",
  actions: "text-right",
};

export function ReportsTable({ rows, pageIndex, pageSize, total, validatedOnly }: {
  rows: ReportRow[];
  pageIndex: number;
  pageSize: number;
  total: number;
  validatedOnly: boolean;
}) {
  const columns = validatedOnly ? dossierColumns : signalementColumns;
  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (report) => report.id,
    manualPagination: true,
    rowCount: total,
    state: { pagination: { pageIndex, pageSize } },
  });

  return (
    <div className="grid min-w-0 gap-4">
      <p className="text-sm font-medium">{total.toLocaleString("fr-FR")} signalement{total > 1 ? "s" : ""}</p>
      <Table aria-label={validatedOnly ? "Liste des dossiers validés" : "Liste des signalements"} className="min-w-[55rem]">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} scope="col"><table.FlexRender header={header} /></TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <ClickableReportRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id} className={cellClasses[cell.column.id]}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </ClickableReportRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}><Empty><EmptyHeader><EmptyTitle>Aucun signalement</EmptyTitle></EmptyHeader></Empty></TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <TablePagination
        page={table.state.pagination.pageIndex}
        size={table.state.pagination.pageSize}
        total={table.getRowCount()}
        pageCount={table.getPageCount()}
        label="Pagination des signalements"
      />
    </div>
  );
}

const signalementSkeletonWidths = ["w-32", "w-28", "w-28", "w-16", "w-24", "w-16", "w-20", "w-16"];
const dossierSkeletonWidths = ["w-32", "w-28", "w-20", "w-16", "w-24", "w-16", "w-20", "w-16"];

export function ReportsTableSkeleton({ validatedOnly = false }: { validatedOnly?: boolean }) {
  const skeletonWidths = validatedOnly ? dossierSkeletonWidths : signalementSkeletonWidths;
  return (
    <div role="status" className="grid min-w-0 gap-4">
      <span className="sr-only">Chargement des signalements</span>
      <div aria-hidden="true" className="grid min-w-0 gap-4">
        <Skeleton className="h-5 w-32" />
        <Table className="min-w-[55rem]">
          <TableHeader>
            <TableRow>
              {skeletonWidths.map((_, index) => (
                <TableHead key={index}>{index < skeletonWidths.length - 1 ? <Skeleton className="h-3 w-14 bg-border" /> : null}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }, (_, row) => (
              <TableRow key={row} className="h-16">
                {skeletonWidths.map((width, index) => (
                  <TableCell key={index}>
                    <Skeleton className={`${width} ${index === skeletonWidths.length - 1 ? "ml-auto h-8" : "h-4"}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
    </div>
  );
}
