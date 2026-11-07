import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { ReexaminationForm } from "@/modules/report/ui/reference-forms";
import { ReexaminationDecisionForm } from "@/modules/report/ui/reexamination-decision-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { id: string; reference: string; reportReference: string; requestText: string; receivedOn: string; status: string; comment: string | null };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const STATUS: Record<string, string> = { received: "Reçue", maintained: "Maintenue", modified: "Modifiée" };

export default function ReexaminationsPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Reexaminations /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Réexamens</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">La demande est enregistrée et peut être maintenue ou modifiée. Le délai de 30 jours n&apos;est pas calculé. Le traitement ne change pas les points.</p>
      </div>
      {canRecord ? <ReexaminationForm /> : null}
      {!requests ? <Alert variant="destructive"><AlertTitle>Les réexamens sont indisponibles. Actualisez la page.</AlertTitle></Alert> : requests.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucune demande.</p> : requests.items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="gap-2"><CardTitle>{item.reference}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{item.reportReference} · {STATUS[item.status] ?? item.status} · reçue le {calendarLabel(item.receivedOn)}</p>
            <p>{item.requestText}</p>
            {item.comment ? <p>{item.comment}</p> : null}
            {canRecord && item.status === "received" ? <ReexaminationDecisionForm id={item.id} /> : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
