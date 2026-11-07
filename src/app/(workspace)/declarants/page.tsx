import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readOutcome } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Report = { id: string; reference: string; status: string; points: number };
type Situation = {
  reference: string;
  points: number;
  primeAmount: number;
  paidAmount: number;
  ceiling: number;
  remainder: number;
  tickets: number;
  lots: number;
  primeApproved: boolean;
  primePaid: boolean;
  reports: Report[];
};

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];
const STATUS: Record<string, string> = {
  received: "Reçu",
  review: "En vérification",
  rejected: "Non retenu",
  confirmed: "Confirmé",
  points: "Points crédités",
};

export default function DeclarantsPage({ searchParams }: PageProps<"/declarants">) {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Declarants searchParams={searchParams} /></Suspense>;
}

async function Declarants({ searchParams }: Pick<PageProps<"/declarants">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const reference = String((await searchParams).reference ?? "").trim();
  const situation = reference ? await readOutcome<Situation>(`/api/declarants?reference=${encodeURIComponent(reference)}`) : null;
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Situation du déclarant</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">La situation part de la référence d&apos;un signalement. Elle ne reprend aucune information fiscale du vendeur. Les points et les primes affichés suivent la version active. Une autre version reste à part.</p>
      </div>
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="grid min-w-64 flex-1 gap-1 text-sm font-bold">Référence du signalement
          <input className="h-11 rounded-md border border-input bg-card px-3 font-normal" name="reference" defaultValue={reference} maxLength={80} required />
        </label>
        <Button type="submit">Consulter</Button>
      </form>
      {!situation ? <p className="text-sm text-muted-foreground">Indiquez une référence.</p> : !situation.ok ? <Alert variant="destructive"><AlertTitle>{situation.message}</AlertTitle></Alert> : (
        <>
          <Card>
            <CardHeader className="gap-2"><CardTitle>{situation.body.reference}</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>{situation.body.points.toLocaleString("fr-FR")} points · primes {situation.body.primeAmount.toLocaleString("fr-FR")} FC · payé {situation.body.paidAmount.toLocaleString("fr-FR")} FC</p>
              <p>Plafond {situation.body.ceiling.toLocaleString("fr-FR")} FC · solde {situation.body.remainder.toLocaleString("fr-FR")} FC</p>
              <p>{situation.body.tickets} ticket{situation.body.tickets > 1 ? "s" : ""} · {situation.body.lots} lot{situation.body.lots > 1 ? "s" : ""}</p>
              <p>{situation.body.primeApproved ? "Prime approuvée" : "Aucune prime approuvée"} · {situation.body.primePaid ? "Prime payée" : "Aucune prime payée"}</p>
            </CardContent>
          </Card>
          {situation.body.reports.map((report) => (
            <p key={report.id} className="text-sm">{report.reference} · {STATUS[report.status] ?? report.status} · {report.points.toLocaleString("fr-FR")} points</p>
          ))}
        </>
      )}
    </section>
  );
}
