import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ActivateRuleForm, PreviewRuleForm, RecordRuleForm } from "@/modules/report/ui/rule-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { FigureRows } from "@/components/figures";
import { Ledger, LedgerItem } from "@/components/ledger";
import { BudgetForm } from "@/modules/report/ui/campaign-reporting-forms";

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
  return <Suspense fallback={<PageSkeleton />}><Rules /></Suspense>;
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
    <Page className="max-w-6xl">
      <PageHeader
        title="Règles"
        description="Une nouvelle version vaut pour les signalements déposés après son activation. Les points historiques gardent leur version. La prévisualisation n'active rien."
        actions={canChange ? (
          <>
            <ActionDialog label="Budget prévisionnel" title="Budget des primes"><BudgetForm /></ActionDialog>
            <ActionDialog label="Prévisualiser" title="Prévisualiser une règle"><PreviewRuleForm /></ActionDialog>
            <ActionDialog label="Nouvelle version" title="Nouvelle version" variant="default"><RecordRuleForm /></ActionDialog>
          </>
        ) : undefined}
      />
      {!rules ? <Alert variant="destructive"><AlertTitle>Les règles sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <Ledger>
          {rules.versions.map((version) => (
            <LedgerItem
              key={version.id}
              title={<span className="ref text-sm font-medium">{version.code}</span>}
              status={<Badge variant={version.active ? "success" : "outline"}>{version.active ? "Active" : "En attente"}</Badge>}
              meta={`Enregistrée le ${reportedAtLabel(version.recordedAt)}`}
              action={canChange && !version.active ? <ActivateRuleForm id={version.id} /> : undefined}
            >
              <FigureRows
                className="gap-x-8 sm:grid-cols-2"
                rows={[
                  ["Fausse facture", version.fakeInvoice],
                  ["Transmission", version.missingTransmission],
                  ["Minorée", version.understated],
                  ["Non normalisée", version.nonNormalized],
                  ["Refus", version.refusal],
                  ["Bonus", version.bonus],
                  ["Plafond", `${version.ceiling.toLocaleString("fr-FR")} FC`],
                  ["Par jour", `${version.dailyCap} signalements`],
                  ["Écart", `${version.spacingDays} jours`],
                  ["Paliers", version.tiers.length],
                ]}
              />
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </Page>
  );
}
