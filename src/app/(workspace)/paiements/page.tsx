import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/filter-bar";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { LedgerEmpty } from "@/components/ledger";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { readJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { DOSSIER_PAYMENT_STATUSES, pageIndex, type DossierPayment, type ListPage } from "@/modules/report/model/administration";
import { francs } from "@/modules/report/model/reward";

export default function PaymentsPage({ searchParams }: PageProps<"/paiements">) {
  return <Suspense fallback={<PageSkeleton />}><Payments searchParams={searchParams} /></Suspense>;
}

async function Payments({ searchParams }: Pick<PageProps<"/paiements">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!can(account, "payment.read") || !can(account, "report.read")) redirect("/signalements");

  const params = await searchParams;
  const page = pageIndex(params.page);
  const rawStatus = typeof params.status === "string" ? params.status : "";
  const status = Object.hasOwn(DOSSIER_PAYMENT_STATUSES, rawStatus) ? rawStatus : "";
  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  const payments = await readJson<ListPage<DossierPayment>>(`/api/dossier-payments?${query}`).catch(() => null);

  return (
    <Page>
      <PageHeader title="Paiements" actions={
        <>
          <Button variant="outline" nativeButton={false} render={<Link href="/etats" />}>États de paiement</Button>
          {can(account, "sample.read") ? <Button variant="outline" nativeButton={false} render={<Link href="/echantillons" />}>Échantillons</Button> : null}
        </>
      } />
      <div className="max-w-xl">
        <FilterBar key={status} action="/paiements" label="Filtres des paiements" clearHref={status ? "/paiements" : undefined}>
          <Field className="min-w-0">
            <FieldLabel htmlFor="filter-status">Statut</FieldLabel>
            <NativeSelect id="filter-status" name="status" defaultValue={status} className="w-full">
              <NativeSelectOption value="">Tous les statuts</NativeSelectOption>
              {Object.entries(DOSSIER_PAYMENT_STATUSES).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </FilterBar>
      </div>
      {!payments ? <Alert variant="destructive"><AlertTitle>Les paiements sont indisponibles.</AlertTitle></Alert>
        : payments.items.length === 0 ? <LedgerEmpty>Aucun paiement pour ce filtre.</LedgerEmpty> : (
          <div className="grid gap-4">
            <Table aria-label="Paiements par dossier">
              <TableHeader><TableRow><TableHead>Dossier</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead>État de paiement</TableHead></TableRow></TableHeader>
              <TableBody>{payments.items.map(payment => (
                <TableRow key={payment.reportId}>
                  <TableCell><Link className="font-medium text-primary hover:underline" href={`/signalements/${payment.reportId}?list=validation%3Dvalidated`}>{payment.reference}</Link></TableCell>
                  <TableCell className="tabular-nums">{francs(payment.amount)}</TableCell>
                  <TableCell><Badge variant={payment.status === "paid" ? "success" : payment.status === "failed" ? "destructive" : "secondary"}>{DOSSIER_PAYMENT_STATUSES[payment.status]}</Badge></TableCell>
                  <TableCell>{payment.statementId ? <Link className="text-primary hover:underline" href={`/etats/${payment.statementId}`}>Ouvrir l’état</Link> : "—"}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
            <TablePagination page={payments.page} size={payments.size} total={payments.total} label="Pagination des paiements" />
          </div>
        )}
    </Page>
  );
}
