import { can } from "@/modules/access/model/account";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { PrepareSampleForm } from "@/modules/report/ui/prepare-sample-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem, LedgerLink } from "@/components/ledger";

type Item = { id: string; reference: string; periodStart: string; periodEnd: string; lines: number; preparedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };


export default function SamplesPage() {
  return <Suspense fallback={<PageSkeleton />}><Samples /></Suspense>;
}

async function Samples() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!can(account, "sample.read")) {
    redirect("/signalements");
  }
  const samples = await readJson<Page>("/api/payment-samples?page=0").catch(() => null);
  const canPrepare = can(account, "sample.review");
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Échantillon des récompenses payées"
        actions={canPrepare ? <ActionDialog label="Constituer un échantillon" title="Constituer un échantillon" variant="default"><PrepareSampleForm /></ActionDialog> : undefined}
      />
      {!samples ? <Alert variant="destructive"><AlertTitle>Les échantillons sont indisponibles. Actualisez la page.</AlertTitle></Alert> : samples.items.length === 0 ? <LedgerEmpty>Aucun échantillon.</LedgerEmpty> : (
        <Ledger>
          {samples.items.map((sample) => (
            <LedgerItem key={sample.id} title={<span className="ref">{sample.reference}</span>} action={
              <LedgerLink href={`/echantillons/${sample.id}`}>Ouvrir l’échantillon<span className="sr-only"> {sample.reference}</span></LedgerLink>
            }>
              <p>{sample.lines} récompense{sample.lines > 1 ? "s" : ""}</p>
              <p className="text-muted-foreground">Du {calendarLabel(sample.periodStart)} au {calendarLabel(sample.periodEnd)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
