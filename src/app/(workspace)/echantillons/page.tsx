import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { calendarLabel } from "@/modules/report/model/report";
import { PrepareSampleForm } from "@/modules/report/ui/prepare-sample-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { id: string; reference: string; periodStart: string; periodEnd: string; lines: number; preparedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function SamplesPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Samples /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Échantillon des primes payées</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">L&apos;échantillon retient 5 % des primes payées sur la période, arrondi au nombre supérieur. Le paiement n&apos;est pas modifié.</p>
      </div>
      {canPrepare ? <PrepareSampleForm /> : null}
      {!samples ? <Alert variant="destructive"><AlertTitle>Les échantillons sont indisponibles. Actualisez la page.</AlertTitle></Alert> : samples.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun échantillon.</p> : (
        <div className="grid gap-4">
          {samples.items.map((sample) => (
            <Card key={sample.id}>
              <CardHeader className="gap-2"><CardTitle><Link className="underline-offset-4 hover:underline" href={`/echantillons/${sample.id}`}>{sample.reference}</Link></CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p>{sample.lines} prime{sample.lines > 1 ? "s" : ""} · du {calendarLabel(sample.periodStart)} au {calendarLabel(sample.periodEnd)}.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
