import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { CorrectionForm } from "@/modules/report/ui/reference-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Item = { id: string; reportReference: string; reason: string; recordedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function CorrectionsPage() {
  return <Suspense fallback={<PageSkeleton />}><Corrections /></Suspense>;
}

async function Corrections() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const corrections = await readJson<Page>("/api/corrections?page=0").catch(() => null);
  const canRecord = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Corrections"
        description="Les récompenses déjà payées ne sont pas reprises."
        actions={canRecord ? <ActionDialog label="Enregistrer une correction" title="Enregistrer une correction" variant="default"><CorrectionForm /></ActionDialog> : undefined}
      />
      {!corrections ? <Alert variant="destructive"><AlertTitle>Les corrections sont indisponibles. Actualisez la page.</AlertTitle></Alert> : corrections.items.length === 0 ? <LedgerEmpty>Aucune correction.</LedgerEmpty> : (
        <Ledger>
          {corrections.items.map((item) => (
            <LedgerItem key={item.id} title={<span className="ref text-sm font-medium">{item.reportReference}</span>}>
              <p>{item.reason}</p>
              <p className="text-muted-foreground">Enregistrée le {reportedAtLabel(item.recordedAt)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
