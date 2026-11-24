import { can } from "@/modules/access/model/account";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson, readOutcome } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FilterBar } from "@/components/filter-bar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Figure, Figures } from "@/components/figures";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/table-pagination";
import { pageIndex, type DeclarantOverview, type ListPage } from "@/modules/report/model/administration";
import { Ledger, LedgerEmpty } from "@/components/ledger";
import { BeneficiaryForm } from "@/modules/report/ui/beneficiary-form";

type Report = { id: string; reference: string; status: string };
type Situation = {
  reference: string;
  rewardAmount: number;
  paidAmount: number;
  ceiling: number;
  remainder: number;
  tickets: number;
  lots: number;
  rewardApproved: boolean;
  rewardPaid: boolean;
  reports: Report[];
};

const STATUS: Record<string, string> = {
  received: "Reçu",
  review: "En vérification",
  rejected: "Non retenu",
  confirmed: "Confirmé",
};

export default function DeclarantsPage({ searchParams }: PageProps<"/declarants">) {
  return <Suspense fallback={<PageSkeleton />}><Declarants searchParams={searchParams} /></Suspense>;
}

async function Declarants({ searchParams }: Pick<PageProps<"/declarants">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "declarant.read")) {
    redirect("/signalements");
  }
  const params = await searchParams;
  const reference = typeof params.reference === "string" ? params.reference.trim() : "";
  const page = pageIndex(params.page);
  const canReadOverview = account.role === "ADMINISTRATOR";
  const overview = !reference && canReadOverview
    ? await readJson<ListPage<DeclarantOverview>>(`/api/declarants/overview?page=${page}`).catch(() => null)
    : null;
  const situation = reference ? await readOutcome<Situation>(`/api/declarants?reference=${encodeURIComponent(reference)}`) : null;
  const canVerify = can(account, "beneficiary.verify");
  const beneficiary = reference && can(account, "reward.read")
    ? await readOutcome<{ verified: boolean; accounts: number; reservedAmount: number; remainder: number }>(`/api/beneficiaries?reference=${encodeURIComponent(reference)}`)
    : null;
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title={reference ? "Situation du déclarant" : "Déclarants"}
      />
      <div className="max-w-2xl">
        <FilterBar
          key={reference}
          action="/declarants"
          label="Recherche d’un déclarant"
          submitLabel="Consulter"
          clearHref={reference ? "/declarants" : undefined}
        >
          <Field className="min-w-0">
            <FieldLabel htmlFor="declarant-reference">Référence du signalement</FieldLabel>
            <Input id="declarant-reference" name="reference" type="search" defaultValue={reference} maxLength={80} required />
          </Field>
        </FilterBar>
      </div>
      {!reference && canReadOverview ? <DeclarantTable overview={overview} /> : null}
      {!situation ? null : !situation.ok ? <Alert variant="destructive"><AlertTitle>{situation.message}</AlertTitle></Alert> : (
        <>
          <div className="grid gap-4">
            <p className="ref text-sm font-medium">{situation.body.reference}</p>
            <Figures>
              <Figure label="Récompenses (FC)" value={situation.body.rewardAmount.toLocaleString("fr-FR")} />
              <Figure label="Payé (FC)" value={situation.body.paidAmount.toLocaleString("fr-FR")} />
              <Figure label="Solde (FC)" value={situation.body.remainder.toLocaleString("fr-FR")} note={`Plafond de ${situation.body.ceiling.toLocaleString("fr-FR")} FC`} />
            </Figures>
            <p className="text-sm leading-6 text-muted-foreground">{situation.body.tickets} ticket{situation.body.tickets > 1 ? "s" : ""} · {situation.body.lots} lot{situation.body.lots > 1 ? "s" : ""} · {situation.body.rewardApproved ? "Récompense approuvée" : "Aucune récompense approuvée"} · {situation.body.rewardPaid ? "Récompense payée" : "Aucune récompense payée"}</p>
          </div>
          <PageSection title="Signalements">
            <Ledger>
              {situation.body.reports.map((report) => (
                <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-sm">
                  <span className="ref">{report.reference}</span>
                  <span className="flex items-center gap-4"><Badge variant="secondary">{STATUS[report.status] ?? report.status}</Badge></span>
                </li>
              ))}
            </Ledger>
          </PageSection>
          {beneficiary?.ok ? (
            <PageSection title="Identité et plafond du bénéficiaire">
              {beneficiary.body.verified ? <p className="text-sm">Identité vérifiée · {beneficiary.body.accounts} compte(s) rattaché(s) · {beneficiary.body.reservedAmount.toLocaleString("fr-FR")} FC approuvés ou payés · {beneficiary.body.remainder.toLocaleString("fr-FR")} FC disponibles.</p>
                : <><p className="text-sm">Une vérification de l’identité est requise avant toute approbation de récompense.</p>{canVerify ? <BeneficiaryForm reference={reference} /> : null}</>}
            </PageSection>
          ) : null}
        </>
      )}
    </Page>
  );
}


function DeclarantTable({ overview }: { overview: ListPage<DeclarantOverview> | null }) {
  if (!overview) return <Alert variant="destructive"><AlertTitle>Les compteurs des déclarants sont indisponibles.</AlertTitle></Alert>;
  if (!overview.items.length) return <LedgerEmpty>Aucun déclarant sur cette page.</LedgerEmpty>;

  return (
    <div className="grid gap-4">
      <Table aria-label="Signalements par déclarant">
        <TableHeader><TableRow>
          <TableHead>Déclarant</TableHead><TableHead>Total</TableHead><TableHead>Validés</TableHead>
          <TableHead>Rejetés</TableHead><TableHead>Doublons</TableHead><TableHead>En cours</TableHead>
        </TableRow></TableHeader>
        <TableBody>{overview.items.map(item => (
          <TableRow key={item.reportId}>
            <TableCell>
              <Link className="font-medium text-primary hover:underline" href={`/declarants?reference=${encodeURIComponent(item.reference)}`}>
                {item.name ?? "Déclarant non renseigné"}
              </Link>
              {!item.identified ? <p className="text-xs text-muted-foreground">Compte non identifié</p> : null}
            </TableCell>
            <TableCell className="tabular-nums">{item.total}</TableCell>
            <TableCell className="tabular-nums">{item.validated}</TableCell>
            <TableCell className="tabular-nums">{item.rejected}</TableCell>
            <TableCell className="tabular-nums">{item.duplicates}</TableCell>
            <TableCell className="tabular-nums">{item.pending}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
      <TablePagination page={overview.page} size={overview.size} total={overview.total} label="Pagination des déclarants" />
    </div>
  );
}
