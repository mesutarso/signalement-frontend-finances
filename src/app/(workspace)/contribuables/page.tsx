import Link from "next/link";
import { can } from "@/modules/access/model/account";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { KeepTaxpayersForm } from "@/modules/report/ui/keep-taxpayers-form";
import { VerifyTaxpayerForm } from "@/modules/report/ui/verify-taxpayer-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { ViewTabs } from "@/components/view-tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { pageIndex, type CompanyOverview, type ListPage } from "@/modules/report/model/administration";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Item = { id: string; taxId: string; name: string | null; verified: boolean; recordedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };


export default function TaxpayersPage({ searchParams }: PageProps<"/contribuables">) {
  return <Suspense fallback={<PageSkeleton />}><Taxpayers searchParams={searchParams} /></Suspense>;
}

async function Taxpayers({ searchParams }: Pick<PageProps<"/contribuables">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "taxpayer.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const page = pageIndex(params.page);
  const isAdmin = account.role === "ADMINISTRATOR";
  const companies = isAdmin && params.vue !== "registre";
  const [overview, taxpayers] = await Promise.all([
    companies ? readJson<ListPage<CompanyOverview>>(`/api/taxpayers/overview?page=${page}`).catch(() => null) : null,
    companies ? null : readJson<Page>(`/api/taxpayers?page=${page}`).catch(() => null),
  ]);
  const canKeep = can(account, "taxpayer.verify");
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Contribuables"
        actions={companies && can(account, "dossier.read")
          ? <Button variant="outline" nativeButton={false} render={<Link href="/dossiers" />}>Constats par établissement</Button>
          : canKeep ? <KeepTaxpayersForm /> : undefined}
      />
      {isAdmin ? <ViewTabs label="Vues des contribuables" items={[
        { href: "/contribuables", label: "Entreprises signalées", active: companies },
        { href: "/contribuables?vue=registre", label: "Registre fiscal", active: !companies },
      ]} /> : null}
      {companies ? <CompanyTable overview={overview} /> : !taxpayers ? <Alert variant="destructive"><AlertTitle>Les contribuables sont indisponibles. Actualisez la page.</AlertTitle></Alert> : taxpayers.items.length === 0 ? <LedgerEmpty>Aucun contribuable.</LedgerEmpty> : (
        <Ledger>
          {taxpayers.items.map((taxpayer) => (
            <LedgerItem
              key={taxpayer.id}
              title={<span className="ref text-sm font-medium">{taxpayer.taxId}</span>}
              status={<Badge variant={taxpayer.verified ? "success" : "warning"}>{taxpayer.verified ? "Vérifié" : "Non vérifié"}</Badge>}
              action={canKeep && !taxpayer.verified ? <VerifyTaxpayerForm id={taxpayer.id} /> : undefined}
            >
              {taxpayer.name ? <p className="font-medium">{taxpayer.name}</p> : null}
              <p className="text-muted-foreground">Retenu le {reportedAtLabel(taxpayer.recordedAt)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
      {!companies && taxpayers && taxpayers.total > taxpayers.size ? <TablePagination page={taxpayers.page} size={taxpayers.size} total={taxpayers.total} label="Pagination du registre" /> : null}
    </Page>
  );
}


function CompanyTable({ overview }: { overview: ListPage<CompanyOverview> | null }) {
  if (!overview) return <Alert variant="destructive"><AlertTitle>Les entreprises signalées sont indisponibles.</AlertTitle></Alert>;
  if (!overview.items.length) return <LedgerEmpty>Aucune entreprise identifiée sur cette page.</LedgerEmpty>;

  return (
    <div className="grid gap-4">
      <Table aria-label="Factures par entreprise">
        <TableHeader><TableRow>
          <TableHead>Entreprise</TableHead><TableHead>Factures</TableHead><TableHead>Avec manquement</TableHead>
          <TableHead>Sans manquement retenu</TableHead><TableHead>À examiner</TableHead><TableHead>Doublons</TableHead>
        </TableRow></TableHeader>
        <TableBody>{overview.items.map(item => (
          <TableRow key={item.taxId ? `nif:${item.taxId}` : `nom:${item.name}`}>
            <TableCell>
              <p className="font-medium">{item.name ?? "Nom non renseigné"}</p>
              <p className="text-xs text-muted-foreground">{item.taxId ?? "NIF non renseigné"}</p>
            </TableCell>
            <TableCell className="tabular-nums">{item.total}</TableCell>
            <TableCell className="tabular-nums">{item.validated}</TableCell>
            <TableCell className="tabular-nums">{item.rejected}</TableCell>
            <TableCell className="tabular-nums">{item.pending}</TableCell>
            <TableCell className="tabular-nums">{item.duplicates}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <TablePagination page={overview.page} size={overview.size} total={overview.total} label="Pagination des entreprises signalées" />
    </div>
  );
}
