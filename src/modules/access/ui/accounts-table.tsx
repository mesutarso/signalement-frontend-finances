"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";
import { TablePagination } from "@/components/table-pagination";
import { EditAccountDialog } from "@/modules/access/ui/edit-account-dialog";
import { createColumnHelper, createSortedRowModel, rowSortingFeature, sortFns, tableFeatures, useTable } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { roleLabel, type Account, type AccountPage } from "@/modules/access/model/account";

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns });
const helper = createColumnHelper<typeof features, Account>();
const columns = helper.columns([
  helper.accessor("username", { header: "Identifiant", cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> }),
  helper.accessor((account) => roleLabel(account.role), { id: "role", header: "Rôle" }),
  helper.accessor("enabled", { header: "État", cell: ({ getValue }) => <Badge variant={getValue() ? "success" : "destructive"}>{getValue() ? "Actif" : "Inactif"}</Badge> }),
  helper.display({ id: "actions", header: "Actions", cell: ({ row }) => <EditAccountDialog account={row.original} /> }),
]);

export function AccountsTable({ page }: { page: AccountPage }) {
  const table = useTable({ features, columns, data: page.accounts, getRowId: (account) => account.id });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold">{page.total} compte{page.total > 1 ? "s" : ""}</p>
        <p className="text-[13px] text-muted-foreground">Le tri s’applique à la page affichée</p>
      </div>
      <Table aria-label="Liste des comptes">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead key={header.id} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"} className={header.column.id === "actions" ? "text-right" : undefined}>
                    {header.column.getCanSort() ? (
                      <button type="button" onClick={header.column.getToggleSortingHandler()} className={cn("group/sort -ml-1 inline-flex items-center gap-1 rounded-sm px-1 py-1 transition-colors hover:text-foreground", sorted && "text-foreground")}>
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
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => <TableCell key={cell.id} className={cell.column.id === "actions" ? "text-right" : undefined}><table.FlexRender cell={cell} /></TableCell>)}
            </TableRow>
          ))}
          {page.accounts.length === 0 ? <TableRow><TableCell colSpan={4}><Empty><EmptyHeader><EmptyTitle>Aucun compte</EmptyTitle><EmptyDescription>Aucun compte ne correspond à cette liste.</EmptyDescription></EmptyHeader></Empty></TableCell></TableRow> : null}
        </TableBody>
      </Table>
      <TablePagination page={page.page} size={page.size} total={page.total} label="Pagination des comptes" />
    </div>
  );
}
