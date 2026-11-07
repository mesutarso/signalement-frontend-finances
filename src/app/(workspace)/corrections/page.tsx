import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { CorrectionForm } from "@/modules/report/ui/reference-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { id: string; reportReference: string; reason: string; recordedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function CorrectionsPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Corrections /></Suspense>;
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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Corrections</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Une confirmation tombée garde le crédit d&apos;origine et ajoute un mouvement inverse. Une prime déjà payée n&apos;est pas reprise. Le ticket qui n&apos;a pas encore de lot sort du tirage.</p>
      </div>
      {canRecord ? <CorrectionForm /> : null}
      {!corrections ? <Alert variant="destructive"><AlertTitle>Les corrections sont indisponibles. Actualisez la page.</AlertTitle></Alert> : corrections.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucune correction.</p> : corrections.items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="gap-2"><CardTitle>{item.reportReference}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{item.reason}</p>
            <p>Enregistrée le {reportedAtLabel(item.recordedAt)}.</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
