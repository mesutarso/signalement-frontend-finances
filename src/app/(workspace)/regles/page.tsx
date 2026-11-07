import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ActivateRuleForm, PreviewRuleForm, RecordRuleForm } from "@/modules/report/ui/rule-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Tier = { threshold: number; amount: number };
type Version = {
  id: string;
  code: string;
  fakeInvoice: number;
  missingTransmission: number;
  understated: number;
  nonNormalized: number;
  refusal: number;
  bonus: number;
  ceiling: number;
  dailyCap: number;
  spacingDays: number;
  tiers: Tier[];
  active: boolean;
  recordedAt: string;
};

const READERS = ["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"];

export default function RulesPage() {
  return <Suspense fallback={<Skeleton className="h-96 w-full" />}><Rules /></Suspense>;
}

async function Rules() {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  if (!READERS.includes(account.role)) {
    redirect("/signalements");
  }
  const rules = await readJson<{ versions: Version[] }>("/api/rules").catch(() => null);
  const canChange = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-primary">Règles</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">Une nouvelle version vaut pour les nouveaux crédits. Les points déjà acquis restent sur leur version. Ils ne sont pas mêlés. La prévisualisation n&apos;active rien.</p>
      </div>
      {!rules ? <Alert variant="destructive"><AlertTitle>Les règles sont indisponibles. Actualisez la page.</AlertTitle></Alert> : rules.versions.map((version) => (
        <Card key={version.id}>
          <CardHeader className="gap-2">
            <CardTitle>{version.code} · {version.active ? "Active" : "En attente"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>Fausse facture {version.fakeInvoice} · transmission {version.missingTransmission} · minorée {version.understated} · non normalisée {version.nonNormalized} · refus {version.refusal} · bonus {version.bonus}</p>
            <p>Plafond {version.ceiling.toLocaleString("fr-FR")} FC · {version.dailyCap} signalements par jour · écart de {version.spacingDays} jours</p>
            <p>{version.tiers.length} paliers · enregistrée le {reportedAtLabel(version.recordedAt)}</p>
            {canChange && !version.active ? <ActivateRuleForm id={version.id} /> : null}
          </CardContent>
        </Card>
      ))}
      {canChange ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Prévisualiser</CardTitle></CardHeader>
            <CardContent><PreviewRuleForm /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Nouvelle version</CardTitle></CardHeader>
            <CardContent><RecordRuleForm /></CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
