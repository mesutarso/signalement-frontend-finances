import Link from "next/link";
import { Button } from "@/components/ui/button";
import { can } from "@/modules/access/model/account";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { payoutStateLabel, type Reward } from "@/modules/report/model/reward";
import type { TransferEnvironment } from "@/modules/report/model/transfer";
import { reportedAtLabel } from "@/modules/report/model/report";
import { RewardsTable } from "@/modules/report/ui/rewards-table";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { Ledger, LedgerEmpty, LedgerItem } from "@/components/ledger";

type RewardPage = { items: Reward[]; page: number; size: number; total: number; environment: TransferEnvironment; paymentConfigured: boolean };
type Payout = { id: string; phone: string | null; state: string; updatedAt: string };
type PayoutPage = { items: Payout[]; page: number; size: number; total: number };

export default function RewardsPage({ searchParams }: PageProps<"/recompenses">) {
  return <Suspense fallback={<PageSkeleton />}><Rewards searchParams={searchParams} /></Suspense>;
}

async function PayoutNumbers() {
  const payouts = await readJson<PayoutPage>("/api/payout-numbers?page=0").catch(() => null);
  return (
    <PageSection title="Numéros de paiement">
      {!payouts ? <Alert variant="destructive"><AlertTitle>Les numéros sont indisponibles. Actualisez la page.</AlertTitle></Alert> : payouts.items.length === 0 ? <LedgerEmpty>Aucun numéro de paiement enregistré.</LedgerEmpty> : (
        <Ledger>
          {payouts.items.map((payout) => (
            <LedgerItem key={payout.id} title={payoutStateLabel(payout.state)} className="py-3.5">
              {payout.state === "ready" && payout.phone ? <p className="tabular-nums">{payout.phone}</p> : null}
              <p className="text-muted-foreground">Enregistré le {reportedAtLabel(payout.updatedAt)}.</p>
            </LedgerItem>
          ))}
        </Ledger>
      )}
    </PageSection>
  );
}

async function Rewards({ searchParams }: Pick<PageProps<"/recompenses">, "searchParams">) {
  const account = await readCurrentAccount();
  if (!account) {
    redirect("/connexion");
  }
  const params = await searchParams;
  const number = Number(params.page ?? 0);
  const page = Number.isSafeInteger(number) && number >= 0 ? number : 0;
  const canRead = can(account, "reward.read");
  const canPay = can(account, "payment.execute");
  if (!canRead && !canPay) redirect("/");
  const canReview = can(account, "reward.approve");
  const canReadStatements = can(account, "payment.read");
  const rewards = await readJson<RewardPage>(`/api/rewards?page=${page}`).catch(() => null);
  return (
    <Page className="max-w-7xl">
      <PageHeader title="Récompenses" actions={
        <div className="flex flex-wrap items-center gap-2">
          {canPay && rewards?.environment === "sandbox" ? <Badge variant="warning">Mode test Araka</Badge> : null}
          {canReadStatements ? <Button variant="outline" nativeButton={false} render={<Link href="/etats" />}>États de paiement</Button> : null}
          {can(account, "draw.read") ? <Button variant="outline" nativeButton={false} render={<Link href="/tirages" />}>Tirages</Button> : null}
        </div>
      } />
      {canPay && rewards && !rewards.paymentConfigured ? (
        <Alert variant="destructive"><AlertTitle>Le service de versement Araka est indisponible.</AlertTitle></Alert>
      ) : null}
      {!rewards ? <Alert variant="destructive"><AlertTitle>Les récompenses sont indisponibles. Actualisez la page.</AlertTitle></Alert> : (
        <div className="grid gap-5">
          {rewards.items.length === 0
            ? <LedgerEmpty>{canRead ? "Aucune récompense sur cette page." : "Aucune récompense dans un état autorisé sur cette page."}</LedgerEmpty>
            : <RewardsTable key={rewards.page} rewards={rewards.items} environment={rewards.environment}
                configured={rewards.paymentConfigured} canPay={canPay} canCheck={can(account, "payment.check")}
                canReview={canReview} canReadReports={can(account, "report.read")} canReadStatements={canReadStatements} />}
          <TablePagination page={rewards.page} size={rewards.size} total={rewards.total} label="Pagination des récompenses" />
        </div>
      )}
      {canRead ? <Suspense><PayoutNumbers /></Suspense> : null}
    </Page>
  );
}
