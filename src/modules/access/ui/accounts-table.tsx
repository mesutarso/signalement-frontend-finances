"use client";

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
  helper.accessor("username", { header: "Identifiant", cell: ({ getValue }) => <span className="font-bold">{getValue()}</span> }),
  helper.accessor((account) => roleLabel(account.role), { id: "role", header: "Rôle" }),
  helper.accessor("enabled", { header: "État", cell: ({ getValue }) => <Badge variant={getValue() ? "success" : "destructive"}>{getValue() ? "Actif" : "Inactif"}</Badge> }),
  helper.display({ id: "actions", header: "Actions", cell: ({ row }) => <EditAccountDialog account={row.original} /> }),
]);

export function AccountsTable({ page }: { page: AccountPage }) {
  const table = useTable({ features, columns, data: page.accounts, getRowId: (account) => account.id });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">{page.total} compte{page.total > 1 ? "s" : ""}</span>
        <span className="text-xs text-muted-foreground">Tri sur la page affichée</span>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table aria-label="Liste des comptes">
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
            {page.accounts.length === 0 ? <TableRow><TableCell colSpan={4}><Empty><EmptyHeader><EmptyTitle>Aucun compte</EmptyTitle><EmptyDescription>Aucun compte ne correspond à cette liste.</EmptyDescription></EmptyHeader></Empty></TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page.page} size={page.size} total={page.total} label="Pagination des comptes" />
    </div>
  );
}
