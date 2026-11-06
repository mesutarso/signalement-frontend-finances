"use client";

import Link from "next/link";
import { TablePagination } from "@/components/table-pagination";
import { createColumnHelper, createSortedRowModel, rowSortingFeature, sortFns, tableFeatures, useTable } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { reportedAtLabel, priorityLabel, stateLabel, type ReportSummary, type ReportPage } from "@/modules/report/model/report";

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns });
const helper = createColumnHelper<typeof features, ReportSummary>();
const columns = helper.columns([
  helper.accessor("title", { header: "Titre", cell: ({ row, getValue }) => (
    <span className="block min-w-48 max-w-xl whitespace-normal break-words">
      {getValue() ?? "Sans titre"}
      <span className="mt-1 block text-xs font-medium text-muted-foreground">{row.original.identifier}</span>
    </span>
  ) }),
  helper.accessor("state", { header: "État", cell: ({ getValue }) => stateLabel(getValue()) }),
  helper.accessor("priority", { header: "Priorité", cell: ({ getValue }) => priorityLabel(getValue()) }),
  helper.accessor("assigneeName", { header: "Affectation", cell: ({ getValue }) => getValue() || "Non affecté" }),
  helper.accessor("reporterName", { header: "Déclarant", cell: ({ getValue }) => getValue() || "—" }),
  helper.display({ id: "contacts", header: "Contacts", cell: ({ row }) => (
    <div className="grid gap-1">
      {row.original.reporterPhone ? <span><span className="sr-only">Téléphone : </span>{row.original.reporterPhone}</span> : null}
      {row.original.reporterEmail ? <span className="max-w-64 break-all whitespace-normal"><span className="sr-only">E-mail : </span>{row.original.reporterEmail}</span> : null}
      {!row.original.reporterPhone && !row.original.reporterEmail ? "—" : null}
    </div>
  ) }),
  helper.accessor("reportedAt", { header: "Date du signalement", cell: ({ getValue }) => reportedAtLabel(getValue()) }),
  helper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" nativeButton={false}
        render={<Link href={`/signalements/${row.original.id}`} />}
        aria-label={`Voir les détails : ${row.original.title ?? "signalement"}`}>
        Voir les détails
      </Button>
    ),
  }),
]);

export function ReportsTable({ page }: { page: ReportPage }) {
  const table = useTable({ features, columns, data: page.reports, getRowId: (report) => report.id });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">{page.total} signalement{page.total > 1 ? "s" : ""}</span>
        <span className="text-xs text-muted-foreground">Tri sur la page affichée</span>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table aria-label="Liste des signalements">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id} aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none"}>
                    <button type="button" disabled={!header.column.getCanSort()} onClick={header.column.getToggleSortingHandler()} className="flex w-full items-center justify-between gap-4 py-1 text-left">
                      <table.FlexRender header={header} />
                      <span aria-hidden="true">{!header.column.getCanSort() ? "" : header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : "↕"}</span>
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>)}
              </TableRow>
            ))}
            {page.reports.length === 0 ? <TableRow><TableCell colSpan={8}><Empty><EmptyHeader><EmptyTitle>Aucun signalement</EmptyTitle><EmptyDescription>Aucun signalement ne correspond à cette liste.</EmptyDescription></EmptyHeader></Empty></TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page.page} size={page.size} total={page.total} label="Pagination des signalements" />
    </div>
  );
}
