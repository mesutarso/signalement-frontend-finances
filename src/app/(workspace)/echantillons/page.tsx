import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { PrepareSampleForm } from "@/modules/report/ui/prepare-sample-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Item = { id: string; reference: string; periodStart: string; periodEnd: string; lines: number; preparedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function SamplesPage() {
  return <Suspense fallback={<PageSkeleton />}><Samples /></Suspense>;
}

async function Samples() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const samples = await readJson<Page>("/api/payment-samples?page=0").catch(() => null);
  const canPrepare = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Échantillon des récompenses payées"
        actions={canPrepare ? <ActionDialog label="Constituer un échantillon" title="Constituer un échantillon" variant="default"><PrepareSampleForm /></ActionDialog> : undefined}
      />
      {!samples ? <Alert variant="destructive"><AlertTitle>Les échantillons sont indisponibles. Actualisez la page.</AlertTitle></Alert> : samples.items.length === 0 ? <LedgerEmpty>Aucun échantillon.</LedgerEmpty> : (
        <Ledger>
          {samples.items.map((sample) => (
            <LedgerItem key={sample.id} title={<Link className="ref text-sm font-medium underline-offset-4 hover:text-primary hover:underline" href={`/echantillons/${sample.id}`}>{sample.reference}</Link>}>
              <p>{sample.lines} récompense{sample.lines > 1 ? "s" : ""}</p>
              <p className="text-muted-foreground">Du {calendarLabel(sample.periodStart)} au {calendarLabel(sample.periodEnd)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
