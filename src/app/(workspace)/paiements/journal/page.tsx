import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import { Figure, Figures } from "@/components/figures";
import { LedgerEmpty } from "@/components/ledger";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { TablePagination } from "@/components/table-pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { pageIndex, type ListPage } from "@/modules/report/model/administration";
import { francs } from "@/modules/report/model/reward";
import { TRANSFER_OPERATORS } from "@/modules/report/model/transfer";
import { TransferCheckForm, TransferRetryForm } from "@/modules/report/ui/transfer-forms";

const JOURNAL = "/paiements/journal";
const ENVIRONMENTS = { sandbox: "Sandbox", production: "Production" } as const;
const STATUSES = { paid: "Réussi", failed: "Échoué", pending: "En cours", unknown: "À confirmer" } as const;
const UUID = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Kinshasa" });
const ERRORS: Record<string, string> = {
  declined: "Refusé par l’opérateur", authentication: "Authentification Araka refusée", "circuit-open": "Service temporairement indisponible",
  busy: "Service occupé", "provider-unavailable": "Opérateur temporairement indisponible", "invalid-order": "Ordre invalide",
};

type Environment = keyof typeof ENVIRONMENTS;
type Status = keyof typeof STATUSES;
type Entry = {
  id: string; rewardId: string; statementId: string; statementReference: string; reference: string; transactionId: string | null;
  provider: string; amount: number; state: Status | "submitting"; code: string; startedAt: string; updatedAt: string; retryable: boolean;
};
type Journal = {
  environment: Environment; activeEnvironment: Environment; configured: boolean; counts: Record<Status, number>; entries: ListPage<Entry>;
};

export default function JournalPage({ searchParams }: PageProps<"/paiements/journal">) {
  return <Suspense fallback={<PageSkeleton />}><PaymentJournal searchParams={searchParams} /></Suspense>;
}

async function PaymentJournal({ searchParams }: Pick<PageProps<"/paiements/journal">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!can(account, "payment.read")) redirect("/signalements");
  const params = await searchParams;
  const status = typeof params.status === "string" && Object.hasOwn(STATUSES, params.status) ? params.status : "";
  const environment = typeof params.environment === "string" && Object.hasOwn(ENVIRONMENTS, params.environment) ? params.environment : "";
  const reward = typeof params.historique === "string" && UUID.test(params.historique) ? params.historique : "";
  const query = new URLSearchParams({ page: String(pageIndex(params.page)) });
  if (status) query.set("status", status);
  if (environment) query.set("environment", environment);
  const journal = await readJson<Journal>(`/api/payment-transfers/journal?${query}`).catch(() => null);
  const attempts = journal && reward ? await readJson<Entry[]>(
    `/api/payment-transfers/journal/history?environment=${journal.environment}&rewardId=${reward}`).catch(() => null) : null;

  if (journal) query.set("page", String(journal.entries.page));
  const enabled = journal?.configured && journal.environment === journal.activeEnvironment;
  const canRetry = enabled && can(account, "payment.execute");
  const canCheck = enabled && can(account, "payment.check");
  const back = can(account, "report.read") ? { href: "/paiements", label: "Paiements" } : { href: "/etats", label: "États de paiement" };

  return <Page>
    <PageHeader title="Journal des transactions Araka" back={back} />
    {!journal ? <Alert variant="destructive"><AlertTitle>Le journal des transactions est indisponible.</AlertTitle></Alert> : <>
      <Figures>
        <Figure compact label="Réussis" value={journal.counts.paid.toLocaleString("fr-FR")} />
        <Figure compact label="Échoués" value={journal.counts.failed.toLocaleString("fr-FR")} />
        <Figure compact label="En cours" value={journal.counts.pending.toLocaleString("fr-FR")} />
        <Figure compact label="À confirmer" value={journal.counts.unknown.toLocaleString("fr-FR")} />
      </Figures>
      <FilterBar key={`${journal.environment}:${status}`} action={JOURNAL} label="Filtres du journal des transactions"
        clearHref={status || environment && environment !== journal.activeEnvironment ? JOURNAL : undefined}
        secondary={<Field>
          <FieldLabel htmlFor="journal-status">Statut</FieldLabel>
          <NativeSelect id="journal-status" name="status" defaultValue={status} className="w-full">
            <NativeSelectOption value="">Tous les statuts</NativeSelectOption>
            {Object.entries(STATUSES).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
          </NativeSelect>
        </Field>}>
        <Field className="max-w-sm">
          <FieldLabel htmlFor="journal-environment">Environnement</FieldLabel>
          <NativeSelect id="journal-environment" name="environment" defaultValue={journal.environment} className="w-full">
            {Object.entries(ENVIRONMENTS).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
          </NativeSelect>
        </Field>
      </FilterBar>
      <PageSection title="Dernier versement par récompense">
        {!journal.entries.items.length ? <LedgerEmpty>Aucun versement pour ces filtres.</LedgerEmpty> : <>
          <Table aria-label="Transactions de récompense">
            <TableHeader><TableRow>
              <TableHead>État de paiement</TableHead><TableHead>Référence Araka</TableHead><TableHead>Montant</TableHead>
              <TableHead>Opérateur</TableHead><TableHead>Statut</TableHead><TableHead>Actualisé le</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{journal.entries.items.map(entry => {
              const history = new URLSearchParams(query);
              history.set("historique", entry.rewardId);
              return <TableRow key={entry.id}>
                <TableCell><Link href={`/etats/${entry.statementId}`} className="font-medium text-primary hover:underline">{entry.statementReference}</Link></TableCell>
                <TableCell className="whitespace-nowrap">{entry.reference}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums">{francs(entry.amount)}</TableCell>
                <TableCell>{operator(entry.provider)}</TableCell>
                <TableCell><TransactionStatus entry={entry} /></TableCell>
                <TableCell className="whitespace-nowrap">{date.format(new Date(entry.updatedAt))}</TableCell>
                <TableCell><div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`${JOURNAL}?${history}#historique`} />}>Historique</Button>
                  {canRetry && entry.retryable ? <TransferRetryForm key={entry.id} id={entry.id} statementId={entry.statementId} /> : null}
                  {canCheck && (entry.state === "unknown" || entry.state === "pending" || entry.state === "submitting")
                    ? <TransferCheckForm id={entry.id} statementId={entry.statementId} /> : null}
                </div></TableCell>
              </TableRow>;
            })}</TableBody>
          </Table>
          <TablePagination page={journal.entries.page} size={journal.entries.size} total={journal.entries.total} label="Pagination du journal des transactions" />
        </>}
      </PageSection>
      {reward ? <div id="historique" className="scroll-mt-20">
        <PageSection title="Historique des tentatives" actions={<Link href={`${JOURNAL}?${query}`} className="text-sm text-primary hover:underline">Fermer</Link>}>
          {!attempts ? <Alert variant="destructive"><AlertTitle>L’historique est indisponible.</AlertTitle></Alert>
            : !attempts.length ? <LedgerEmpty>Aucune tentative pour cette récompense.</LedgerEmpty> : (
              <Table aria-label="Historique des tentatives pour la récompense">
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Référence Araka</TableHead><TableHead>ID opérateur</TableHead>
                  <TableHead>Montant</TableHead><TableHead>Opérateur</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                <TableBody>{attempts.map(entry => <TableRow key={entry.id}>
                  <TableCell>{date.format(new Date(entry.startedAt))}</TableCell><TableCell>{entry.reference}</TableCell>
                  <TableCell>{entry.transactionId ?? "—"}</TableCell><TableCell>{francs(entry.amount)}</TableCell>
                  <TableCell>{operator(entry.provider)}</TableCell><TableCell><TransactionStatus entry={entry} /></TableCell>
                </TableRow>)}</TableBody>
              </Table>
            )}
        </PageSection>
      </div> : null}
    </>}
  </Page>;
}

function operator(provider: string) {
  return TRANSFER_OPERATORS.find(([code]) => code === provider.toLowerCase())?.[1] ?? provider;
}

function TransactionStatus({ entry }: { entry: Entry }) {
  const state = entry.state === "submitting" ? "pending" : entry.state;
  return <>
    <Badge variant={state === "paid" ? "success" : state === "failed" ? "destructive" : "secondary"}>{STATUSES[state]}</Badge>
    {state === "failed" ? <p className="mt-1 text-xs text-muted-foreground">{ERRORS[entry.code] ?? entry.code}</p> : null}
  </>;
}
