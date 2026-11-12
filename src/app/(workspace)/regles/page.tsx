import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs } from "@/modules/report/model/reward";
import type { RewardSetting } from "@/modules/report/model/assessment";
import { RewardSettingForm } from "@/modules/report/ui/reward-setting-form";
import { BudgetForm } from "@/modules/report/ui/campaign-reporting-forms";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { ActionDialog } from "@/components/action-dialog";


export default function RulesPage() {
  return <Suspense fallback={<PageSkeleton />}><Rules /></Suspense>;
}

async function Rules() {
  const account = await readCurrentAccount();
  if (!account) redirect("/connexion");
  if (!["SUPERVISOR", "AUDITOR", "ADMINISTRATOR"].includes(account.role)) redirect("/signalements");
  const current = await readJson<RewardSetting>("/api/reward-settings").catch(() => null);
  const canChange = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  return <Page className="max-w-6xl">
    <PageHeader title="Règles" actions={canChange ? <ActionDialog label="Budget prévisionnel" title="Budget des récompenses"><BudgetForm /></ActionDialog> : undefined} />
    <PageSection title="Récompense par signalement validé">
      {!current ? <Alert variant="destructive"><AlertTitle>Le montant est indisponible. Actualisez la page.</AlertTitle></Alert>
        : canChange ? <RewardSettingForm key={current.id} setting={current} /> : <p className="text-2xl font-medium tabular-nums">{francs(current.amount)}</p>}
    </PageSection>
    <PageSection title="Critères de validation">
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-6">
        <li>Assujettissement de l’établissement à la TVA.</li>
        <li>Facture non normalisée.</li>
        <li>Facture non conforme à l’achat réel.</li>
        <li>Facture non encore signalée.</li>
        <li>TVA facturée par une entreprise non assujettie.</li>
      </ol>
      <p className="max-w-[68ch] text-sm leading-6">Une facture inédite est retenue si un établissement assujetti remet une facture non normalisée ou non conforme, ou si une entreprise non assujettie facture de la TVA.</p>
    </PageSection>

  </Page>;
}
