import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ModelForm } from "@/modules/report/ui/model-form";
import { MessageForm } from "@/modules/report/ui/reference-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";
import { Badge } from "@/components/ui/badge";
import { SendMessageForm, TestSmsForm } from "@/modules/report/ui/send-message-form";

type Item = { id: string; reportReference: string; kind: string; body: string; preparedAt: string; status: string; sentAt: string | null; deliveryCode: string | null };
type Page = { items: Item[]; page: number; size: number; total: number };
type Model = { kind: string; body: string; recordedAt: string };
type Models = { models: Model[] };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const STATUS: Record<string, string> = { prepared: "À envoyer", sending: "En cours", accepted: "Transmis", failed: "Échec", unknown: "À confirmer" };
const KINDS: Record<string, string> = {
  photo: "Nouvelle photo",
  payout: "Numéro de paiement",
  reexamination: "Réexamen traité",
  situation: "Situation mise à jour",
};

export default function MessagesPage() {
  return <Suspense fallback={<PageSkeleton />}><Messages /></Suspense>;
}

async function Messages() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const messages = await readJson<Page>("/api/declarant-messages?page=0").catch(() => null);
  const models = await readJson<Models>("/api/document-models").catch(() => null);
  const canPrepare = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <Page className="max-w-6xl">
      <PageHeader
        title="Messages"
        actions={canPrepare ? (
          <>
            {account.role === "ADMINISTRATOR" ? <TestSmsForm /> : null}
            <ActionDialog label="Nouveau modèle" title="Enregistrer un modèle"><ModelForm /></ActionDialog>
            <ActionDialog label="Préparer un message" title="Préparer un message" variant="default"><MessageForm /></ActionDialog>
          </>
        ) : undefined}
      />
      {!messages ? <Alert variant="destructive"><AlertTitle>Les messages sont indisponibles. Actualisez la page.</AlertTitle></Alert> : messages.items.length === 0 ? <LedgerEmpty>Aucun message préparé.</LedgerEmpty> : (
        <Ledger>
          {messages.items.map((item) => (
            <LedgerItem key={item.id} title={KINDS[item.kind] ?? item.kind} meta={`Préparé le ${reportedAtLabel(item.preparedAt)}`}
              status={<Badge variant={item.status === "accepted" ? "success" : item.status === "failed" ? "destructive" : "outline"}>{STATUS[item.status] ?? item.status}</Badge>}>
              <p className="ref text-muted-foreground">{item.reportReference}</p>
              <p>{item.body}</p>
              {item.sentAt ? <p className="text-sm text-muted-foreground">Transmis le {reportedAtLabel(item.sentAt)}</p> : null}
              {canPrepare && ["prepared", "failed"].includes(item.status) ? <SendMessageForm messageId={item.id} /> : null}
            </LedgerItem>
          ))}
        </Ledger>
      )}
      {models && models.models.length > 0 ? (
        <PageSection title="Modèles en vigueur">
          <Ledger>
            {models.models.map((model) => (
              <LedgerItem key={model.kind} title={KINDS[model.kind] ?? model.kind} className="py-3.5">
                <p>{model.body}</p>
              </LedgerItem>
            ))}
          </Ledger>
        </PageSection>
      ) : null}
    </Page>
  );
}
