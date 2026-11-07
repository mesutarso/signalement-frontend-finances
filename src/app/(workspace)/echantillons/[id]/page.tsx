import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { paymentOperatorLabel } from "@/modules/report/model/payment";
import { ReviewSampleForm } from "@/modules/report/ui/review-sample-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Line = { id: string; reference: string; operator: string; amount: number; result: string | null; reason: string | null };
type Detail = { id: string; reference: string; periodStart: string; periodEnd: string; lines: Line[] };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function SamplePage({ params }: PageProps<"/echantillons/[id]">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Sample params={params} /></Suspense>;
}

function resultLabel(result: string | null): string {
  if (result === "conform") {
    return "Conforme";
  }
  if (result === "anomaly") {
    return "Anomalie";
  }
  return "En attente";
}

async function Sample({ params }: Pick<PageProps<"/echantillons/[id]">, "params">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const { id } = await params;
  const sample = await readJson<Detail>(`/api/payment-samples/${id}`).catch(() => null);
  const canReview = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <p><Link className="text-sm font-bold text-primary underline-offset-4 hover:underline" href="/echantillons">Échantillons</Link></p>
      {!sample ? <Alert variant="destructive"><AlertTitle>Cet échantillon est introuvable.</AlertTitle></Alert> : (
        <>
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold text-primary">{sample.reference}</h1>
            <p className="text-sm text-muted-foreground">Du {calendarLabel(sample.periodStart)} au {calendarLabel(sample.periodEnd)}. Le contrôle ne modifie pas le paiement.</p>
          </div>
          {sample.lines.map((line) => (
            <Card key={line.id}>
              <CardHeader className="gap-2"><CardTitle>{line.reference}</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p>{paymentOperatorLabel(line.operator)} · {line.amount.toLocaleString("fr-FR")} FC · {resultLabel(line.result)}</p>
                {line.reason ? <p>{line.reason}</p> : null}
                {canReview && !line.result ? <ReviewSampleForm lineId={line.id} sampleId={sample.id} /> : null}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </section>
  );
}
