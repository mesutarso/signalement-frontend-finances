import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ModelForm } from "@/modules/report/ui/model-form";
import { MessageForm } from "@/modules/report/ui/reference-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { id: string; reportReference: string; kind: string; body: string; preparedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };
type Model = { kind: string; body: string; recordedAt: string };
type Models = { models: Model[] };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const KINDS: Record<string, string> = {
  photo: "Nouvelle photo",
  payout: "Numéro de paiement",
  reexamination: "Réexamen traité",
  situation: "Situation mise à jour",
};

export default function MessagesPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Messages /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Messages</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Le message préparé est le canal vers le déclarant. Il n&apos;est pas envoyé par SMS ni par courriel. Un nouveau modèle vaut pour les messages suivants.</p>
      </div>
      {canPrepare ? <MessageForm /> : null}
      {canPrepare ? <ModelForm /> : null}
      {models && models.models.length > 0 ? (
        <Card>
          <CardHeader className="gap-2"><CardTitle>Modèles en vigueur</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {models.models.map((model) => <p key={model.kind}><span className="font-bold">{KINDS[model.kind] ?? model.kind}. </span>{model.body}</p>)}
          </CardContent>
        </Card>
      ) : null}
      {!messages ? <Alert variant="destructive"><AlertTitle>Les messages sont indisponibles. Actualisez la page.</AlertTitle></Alert> : messages.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun message préparé.</p> : messages.items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="gap-2"><CardTitle>{item.reportReference}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{KINDS[item.kind] ?? item.kind} · préparé le {reportedAtLabel(item.preparedAt)}</p>
            <p>{item.body}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
