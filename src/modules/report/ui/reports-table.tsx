"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowRight01Icon, ArrowUp01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";
import { TablePagination } from "@/components/table-pagination";
import { createColumnHelper, createSortedRowModel, rowSortingFeature, sortFns, tableFeatures, useTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { reportedAtParts, type ReportSummary, type ReportPage } from "@/modules/report/model/report";
import { PriorityMark, ValidationTag } from "@/modules/report/ui/report-marks";

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns });
const helper = createColumnHelper<typeof features, ReportSummary>();
const columns = helper.columns([
  helper.accessor("title", { header: "Signalement", cell: ({ row, getValue }) => {
    const { date } = reportedAtParts(row.original.reportedAt);
    return (
      <span className="block max-w-xl min-w-56 whitespace-normal">
        <Link
          href={`/signalements/${row.original.id}`}
          className="font-medium break-words transition-colors after:absolute after:inset-0 group-hover/row:text-primary"
        >
          {getValue() ?? "Sans titre"}
        </Link>
        <span className="ref mt-0.5 block text-muted-foreground">{row.original.identifier}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
          <ValidationTag state={row.original.validationState} assignmentState={row.original.state} />
          <PriorityMark priority={row.original.priority} />
          <span className="text-[13px] text-muted-foreground">{date}</span>
        </span>
      </span>
    );
  } }),
  helper.accessor("validationState", { header: "État", cell: ({ row, getValue }) => <ValidationTag state={getValue()} assignmentState={row.original.state} /> }),
  helper.accessor("priority", { header: "Priorité", cell: ({ getValue }) => <PriorityMark priority={getValue()} /> }),
  helper.accessor("assigneeName", { header: "Affectation", cell: ({ getValue }) => getValue() || <span className="text-muted-foreground">Non affecté</span> }),
  helper.accessor("reporterName", { header: "Déclarant", cell: ({ row, getValue }) => (
    <span className="grid max-w-52 gap-0.5 whitespace-normal">
      <span className="break-words">{getValue() || <span className="text-muted-foreground">Anonyme</span>}</span>
      {row.original.reporterPhone ? <span className="text-[13px] text-muted-foreground"><span className="sr-only">Téléphone : </span>{row.original.reporterPhone}</span> : null}
      {!row.original.reporterPhone && row.original.reporterEmail ? <span className="text-[13px] break-all text-muted-foreground"><span className="sr-only">E-mail : </span>{row.original.reporterEmail}</span> : null}
    </span>
  ) }),
  helper.accessor("reportedAt", { header: "Reçu le", cell: ({ getValue }) => {
    const { date, time } = reportedAtParts(getValue());
    return <span className="grid gap-0.5 tabular-nums"><span>{date}</span><span className="text-[13px] text-muted-foreground">{time}</span></span>;
  } }),
  helper.display({
    id: "open",
    header: () => <span className="sr-only">Ouvrir</span>,
    cell: () => <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} aria-hidden="true" className="size-4 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0.5 group-hover/row:text-primary group-hover/row:opacity-100" />,
  }),
]);

const VISIBILITY: Record<string, string> = {
  validationState: "hidden sm:table-cell",
  priority: "hidden md:table-cell",
  assigneeName: "hidden lg:table-cell",
  reporterName: "hidden xl:table-cell",
  reportedAt: "hidden sm:table-cell",
  open: "w-8",
};

export function ReportsTable({ page }: { page: ReportPage }) {
  const table = useTable({ features, columns, data: page.reports, getRowId: (report) => report.id });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold">{page.total.toLocaleString("fr-FR")} signalement{page.total > 1 ? "s" : ""}</p>
      </div>
      <Table aria-label="Liste des signalements">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead key={header.id} className={VISIBILITY[header.column.id]} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}>
                    {header.column.getCanSort() ? (
                      <button type="button" title="Trier la page" onClick={header.column.getToggleSortingHandler()} className={cn("group/sort -ml-1 inline-flex items-center gap-1 rounded-sm px-1 py-1 transition-colors hover:text-foreground", sorted && "text-foreground")}>
                        <table.FlexRender header={header} />
                        <HugeiconsIcon icon={sorted === "asc" ? ArrowUp01Icon : sorted === "desc" ? ArrowDown01Icon : UnfoldMoreIcon} strokeWidth={2} aria-hidden="true" className={cn("size-3.5", !sorted && "opacity-0 transition-opacity group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100")} />
                      </button>
                    ) : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group/row relative">
              {row.getAllCells().map((cell) => <TableCell key={cell.id} className={VISIBILITY[cell.column.id]}><table.FlexRender cell={cell} /></TableCell>)}
            </TableRow>
          ))}
          {page.reports.length === 0 ? <TableRow><TableCell colSpan={7}><Empty><EmptyHeader><EmptyTitle>Aucun signalement</EmptyTitle></EmptyHeader></Empty></TableCell></TableRow> : null}
        </TableBody>
      </Table>
      <TablePagination page={page.page} size={page.size} total={page.total} label="Pagination des signalements" />
    </div>
  );
}
