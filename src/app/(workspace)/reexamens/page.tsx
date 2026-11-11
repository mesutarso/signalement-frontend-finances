import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { ReexaminationForm } from "@/modules/report/ui/reference-forms";
import { ReexaminationDecisionForm } from "@/modules/report/ui/reexamination-decision-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type Item = { id: string; reference: string; reportReference: string; requestText: string; receivedOn: string; onTime: boolean; status: string; comment: string | null };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const STATUS: Record<string, string> = { received: "Reçue", maintained: "Maintenue", modified: "Modifiée" };

export default function ReexaminationsPage() {
  return <Suspense fallback={<PageSkeleton />}><Reexaminations /></Suspense>;
}

async function Reexaminations() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const requests = await readJson<Page>("/api/reexaminations?page=0").catch(() => null);
  const canRecord = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Réexamens"
        description="Délai de dépôt : 30 jours calendaires après le dernier constat."
        actions={canRecord ? <ActionDialog label="Enregistrer une demande" title="Enregistrer une demande de réexamen" variant="default"><ReexaminationForm /></ActionDialog> : undefined}
      />
      {!requests ? <Alert variant="destructive"><AlertTitle>Les réexamens sont indisponibles. Actualisez la page.</AlertTitle></Alert> : requests.items.length === 0 ? <LedgerEmpty>Aucune demande.</LedgerEmpty> : (
        <Ledger>
          {requests.items.map((item) => (
            <LedgerItem
              key={item.id}
              title={<span className="ref text-sm font-medium">{item.reference}</span>}
              status={<Badge variant={item.status === "received" ? "warning" : "secondary"}>{STATUS[item.status] ?? item.status}</Badge>}
              meta={`Reçue le ${calendarLabel(item.receivedOn)} · ${item.onTime ? "Dans le délai" : "Hors délai"}`}
              action={canRecord && item.status === "received" ? <ActionDialog label="Décider" title="Décider du réexamen" description={item.reference} variant="default" size="sm"><ReexaminationDecisionForm id={item.id} /></ActionDialog> : undefined}
            >
              <p className="ref text-muted-foreground">{item.reportReference}</p>
              <p>{item.requestText}</p>
              {item.comment ? <p className="text-muted-foreground">{item.comment}</p> : null}
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
