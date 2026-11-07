import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { KeepTaxpayersForm } from "@/modules/report/ui/keep-taxpayers-form";
import { VerifyTaxpayerForm } from "@/modules/report/ui/verify-taxpayer-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Item = { id: string; taxId: string; name: string | null; verified: boolean; recordedAt: string };
type Page = { items: Item[]; page: number; size: number; total: number };

const READERS = ["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function TaxpayersPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Taxpayers /></Suspense>;
}

async function Taxpayers() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const taxpayers = await readJson<Page>("/api/taxpayers?page=0").catch(() => null);
  const canKeep = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Contribuables</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Chaque numéro d&apos;impôt retenu est gardé une seule fois. Il reste non vérifié tant que la vérification ne l&apos;a pas confirmé.</p>
      </div>
      {canKeep ? <KeepTaxpayersForm /> : null}
      {!taxpayers ? <Alert variant="destructive"><AlertTitle>Les contribuables sont indisponibles. Actualisez la page.</AlertTitle></Alert> : taxpayers.items.length === 0 ? <p className="text-sm text-muted-foreground">Aucun contribuable.</p> : (
        <div className="grid gap-4">
          {taxpayers.items.map((taxpayer) => (
            <Card key={taxpayer.id}>
              <CardHeader className="gap-2"><CardTitle>{taxpayer.taxId}</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {taxpayer.name ? <p>{taxpayer.name}</p> : null}
                <p>{taxpayer.verified ? "Vérifié" : "Non vérifié"} · Retenu le {reportedAtLabel(taxpayer.recordedAt)}.</p>
                {canKeep && !taxpayer.verified ? <VerifyTaxpayerForm id={taxpayer.id} /> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
