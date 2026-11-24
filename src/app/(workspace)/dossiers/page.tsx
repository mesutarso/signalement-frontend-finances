import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { pageIndex, type CompanyOverview, type ListPage } from "@/modules/report/model/administration";
import {
  findingLabel,
  proofLabel,
  qualificationDecisionLabel,
  reportedAtLabel,
  type SellerFile,
} from "@/modules/report/model/report";
import { readSellerFiles } from "@/modules/report/queries/read-seller-files";
import { CompanyOverviewTable } from "@/modules/report/ui/company-overview-table";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FilterBar } from "@/components/filter-bar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

export default function SellerFilesPage({ searchParams }: PageProps<"/dossiers">) {
  return <Suspense fallback={<PageSkeleton />}><SellerFiles searchParams={searchParams} /></Suspense>;
}

async function SellerFiles({ searchParams }: Pick<PageProps<"/dossiers">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "dossier.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = !query && (params.status === "identified" || params.status === "unidentified") ? params.status : null;
  const page = pageIndex(params.page);
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Établissements" />
      <div className="grid gap-5">
        <div className="max-w-xl">
          <FilterBar key={query} action="/dossiers" label="Recherche d’établissements" submitLabel="Rechercher" clearHref={query || status ? "/dossiers" : undefined}>
            <Field>
              <FieldLabel htmlFor="establishment-search">NIF ou nom de l’établissement</FieldLabel>
              <Input id="establishment-search" name="q" type="search" defaultValue={query} />
            </Field>
          </FilterBar>
        </div>
        <Suspense key={JSON.stringify([status, query, page])} fallback={<PageSkeleton />}>
          {status ? <Findings status={status} page={page} /> : <Companies page={page} query={query} />}
        </Suspense>
      </div>
    </Page>
  );
}

async function Companies({ page, query }: { page: number; query: string }) {
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("q", query);
  const overview = await readJson<ListPage<CompanyOverview>>(`/api/seller-files/companies?${params}`).catch(() => null);
  if (query && overview?.total === 0) return <LedgerEmpty>Aucun établissement ne correspond à la recherche.</LedgerEmpty>;
  return <CompanyOverviewTable overview={overview} />;
}

async function Findings({ status, page }: { status: string; page: number }) {
  const files = await readSellerFiles(status, page).catch(() => null);
  if (!files) return <Alert variant="destructive"><AlertTitle>Les dossiers sont indisponibles. Actualisez la page.</AlertTitle></Alert>;
  if (!files.items.length) return <LedgerEmpty className="border-t-0">{status === "identified" ? "Aucun constat retenu ne porte un numéro d'impôt." : "Aucun constat retenu n'est sans numéro d'impôt."}</LedgerEmpty>;

  return (
    <div className="grid gap-5">
      <Ledger>
        {files.items.map((file) => <SellerFileCard key={file.taxId ?? file.reports[0]?.reportId} file={file} />)}
      </Ledger>
      <TablePagination page={files.page} size={files.size} total={files.total} label="Pagination des dossiers" />
    </div>
  );
}

function SellerFileCard({ file }: { file: SellerFile }) {
  return (
    <LedgerItem
      title={file.taxId ? <span className="ref text-sm font-medium">{file.taxId}</span> : "Sans numéro d'impôt"}
      status={file.namesDiffer ? <Badge variant="warning">Noms à vérifier</Badge> : undefined}
      meta={<>{file.namesDiffer ? null : file.sellerName ? <span className="block font-medium text-foreground">{file.sellerName}</span> : null}{file.reports.length === 1 ? "1 constat" : `${file.reports.length} constats`} · dernier le {reportedAtLabel(file.latestAt)}</>}
    >
      <ul className="grid divide-y">
        {file.reports.map((report) => {
          const finding = findingLabel(report.finding);
          const proof = proofLabel(report.proof);
          return (
            <li key={report.reportId} className="grid gap-0.5 py-2.5 first:pt-0 last:pb-0">
              <p className="font-medium">{qualificationDecisionLabel(report.decision)}{finding ? ` · ${finding}` : ""}{proof ? <span className="font-normal text-muted-foreground"> · {proof}</span> : ""}</p>
              <p>{report.justification}</p>
              {report.sellerName ? <p className="text-[13px] text-muted-foreground">Nom saisi : {report.sellerName}</p> : null}
              <ReportLink id={report.reportId} />
            </li>
          );
        })}
      </ul>
    </LedgerItem>
  );
}
