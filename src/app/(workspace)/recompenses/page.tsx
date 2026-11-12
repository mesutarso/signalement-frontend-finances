import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { francs, payoutStateLabel, rewardStatusLabel, rewardStatusVariant, type Reward } from "@/modules/report/model/reward";
import { reportedAtLabel } from "@/modules/report/model/report";
import { ReviewRewardForm } from "@/modules/report/ui/review-reward-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { TablePagination } from "@/components/table-pagination";
import { Page, PageHeader, PageSection, PageSkeleton } from "@/components/page";
import { Badge } from "@/components/ui/badge";
import { ActionDialog } from "@/components/action-dialog";
import { Ledger, LedgerEmpty, LedgerItem, ReportLink } from "@/components/ledger";

type Page = { items: Reward[]; page: number; size: number; total: number };
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
  const canReview = account.role === "SUPERVISOR" || account.role === "ADMINISTRATOR";
  const rewards = await readJson<Page>(`/api/rewards?page=${page}`).catch(() => null);
  return (
    <Page className="max-w-6xl">
      <PageHeader title="Récompenses" />
      {!rewards ? <Alert variant="destructive"><AlertTitle>Les récompenses sont indisponibles. Actualisez la page.</AlertTitle></Alert> : rewards.items.length === 0 ? <LedgerEmpty>Aucune récompense proposée.</LedgerEmpty> : (
        <div className="grid gap-5">
          <Ledger>
            {rewards.items.map((tier) => (
              <LedgerItem
                key={tier.id}
                title={<span className="tabular-nums">{francs(tier.amount)}</span>}
                status={<Badge variant={rewardStatusVariant(tier.status)}>{rewardStatusLabel(tier.status)}</Badge>}
                meta="Signalement validé"
                action={canReview && tier.status === "proposed" ? (
                  <ActionDialog label="Examiner" title="Examiner la récompense" description={francs(tier.amount)} variant="default" size="sm">
                    <ReviewRewardForm rewardId={tier.id} />
                  </ActionDialog>
                ) : undefined}
              >
                <p className="text-muted-foreground">Enregistrée le {reportedAtLabel(tier.recordedAt)}.</p>
                {tier.reportId && tier.reportReference ? <ReportLink id={tier.reportId} reference={tier.reportReference} /> : null}
                {tier.phone ? <p>Numéro de paiement : <span className="tabular-nums">{tier.phone}</span></p> : null}
                {tier.reviews.map((review) => (
                  <div key={review.id} className="grid gap-0.5">
                    <p>{rewardStatusLabel(review.result)}{review.reason ? ` : ${review.reason}` : ""}</p>
                    <p className="text-[13px] text-muted-foreground">{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
                  </div>
                ))}
              </LedgerItem>
            ))}
          </Ledger>
          <TablePagination page={rewards.page} size={rewards.size} total={rewards.total} label="Pagination des récompenses" />
        </div>
      )}
      <PayoutNumbers />
    </Page>
  );
}
