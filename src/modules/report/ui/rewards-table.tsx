"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ActionDialog, DialogSurface } from "@/components/action-dialog";
import { ReportLink } from "@/components/ledger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { payReward } from "@/modules/report/actions/transfer-payment";
import { reportedAtLabel } from "@/modules/report/model/report";
import { francs, rewardPaymentStatus, rewardStatusLabel, rewardStatusVariant, type Reward } from "@/modules/report/model/reward";
import { sandboxTransferOperator, TRANSFER_OPERATORS, type TransferEnvironment } from "@/modules/report/model/transfer";
import { ReviewRewardForm } from "./review-reward-form";
import { TransferCheckForm } from "./transfer-forms";

type PayableReward = Reward & { phone: string; payment: NonNullable<Reward["payment"]> & { lineId: string } };
type Outcome = Awaited<ReturnType<typeof payReward>>;

function payable(reward: Reward, environment: TransferEnvironment): reward is PayableReward {
  return Boolean(reward.phone && reward.payment?.lineId
    && ["ready", "failed"].includes(reward.payment.state)
    && (environment === "production" || sandboxTransferOperator(reward.phone)));
}

export function RewardsTable({ rewards, environment, configured, canPay, canCheck, canReview, canReadReports, canReadStatements }: {
  rewards: Reward[];
  environment: TransferEnvironment;
  configured: boolean;
  canPay: boolean;
  canCheck: boolean;
  canReview: boolean;
  canReadReports: boolean;
  canReadStatements: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [targets, setTargets] = useState<PayableReward[] | null>(null);
  const [running, setRunning] = useState(false);
  const eligible = canPay && configured
    ? rewards.filter((reward): reward is PayableReward => payable(reward, environment)) : [];
  const eligibleById = new Map(eligible.map((reward) => [reward.id, reward]));
  const selected = eligible.filter((reward) => selectedIds.has(reward.id));
  const allSelected = eligible.length > 0 && selected.length === eligible.length;
  const selectedTotal = selected.reduce((total, reward) => total + reward.amount, 0);

  function toggle(id: string, checked: boolean) {
    setSelectedIds(current => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <Dialog.Root open={targets !== null} onOpenChange={(open, event) => {
      if (open) return;
      if (running) event.cancel();
      else setTargets(null);
    }}>
      <div className="grid min-w-0 gap-3">
        {canPay && configured ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/15 bg-accent px-4 py-3">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {selected.length > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{selected.length} sélectionnée{selected.length > 1 ? "s" : ""}</span>
                  <span className="mx-2">·</span><span className="tabular-nums">{francs(selectedTotal)}</span>
                </>
              ) : eligible.length > 0 ? "Sélectionnez les récompenses à payer sur cette page." : "Aucune récompense payable sur cette page."}
            </p>
            <Dialog.Trigger disabled={!selected.length} render={<Button />} onClick={() => setTargets(selected)}>
              Payer la sélection
            </Dialog.Trigger>
          </div>
        ) : null}
        <Table aria-label="Tableau des récompenses" className="min-w-[54rem] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary" tabIndex={0}>
          <TableHeader className="bg-accent [&_tr]:border-b-primary/20">
            <TableRow>
              {canPay && configured ? (
                <TableHead scope="col" className="w-10">
                  <input type="checkbox" className="size-4 align-middle accent-primary" aria-label="Sélectionner les récompenses payables de cette page"
                    ref={(input) => { if (input) input.indeterminate = selected.length > 0 && !allSelected; }}
                    checked={allSelected} disabled={!eligible.length}
                    onChange={(event) => setSelectedIds(new Set(event.target.checked ? eligible.map(reward => reward.id) : []))} />
                </TableHead>
              ) : null}
              <TableHead scope="col" className="text-primary">Signalement</TableHead>
              <TableHead scope="col" className="text-right text-primary">Montant</TableHead>
              <TableHead scope="col" className="text-primary">Date d’enregistrement</TableHead>
              <TableHead scope="col" className="text-primary">Numéro Mobile Money</TableHead>
              <TableHead scope="col" className="text-primary">Approbation</TableHead>
              <TableHead scope="col" className="text-primary">Versement</TableHead>
              <TableHead scope="col" className="text-right text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => {
              const candidate = eligibleById.get(reward.id);
              const payment = reward.payment;
              const testBlocked = environment === "sandbox" && payment?.state === "ready" && reward.phone && !sandboxTransferOperator(reward.phone);
              const status = testBlocked ? { label: "Numéro hors test", variant: "outline" as const } : rewardPaymentStatus(reward);
              const selected = Boolean(candidate && selectedIds.has(reward.id));
              const canVerify = canCheck && payment?.transferId && ["submitting", "pending", "unknown"].includes(payment.state);
              return (
                <TableRow key={reward.id} data-state={selected ? "selected" : undefined}>
                  {canPay && configured ? (
                    <TableCell>
                      {candidate ? <input type="checkbox" className="size-4 align-middle accent-primary"
                        aria-label={`Sélectionner la récompense de ${francs(reward.amount)} enregistrée le ${reportedAtLabel(reward.recordedAt)}`} checked={selected}
                        onChange={(event) => toggle(reward.id, event.target.checked)} /> : null}
                    </TableCell>
                  ) : null}
                  <TableCell>
                    {canReadReports && reward.reportId ? <ReportLink id={reward.reportId} /> : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{francs(reward.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{reportedAtLabel(reward.recordedAt)}</TableCell>
                  <TableCell className="tabular-nums">{reward.phone ?? <span className="text-muted-foreground">Non renseigné</span>}</TableCell>
                  <TableCell>
                    <Badge variant={rewardStatusVariant(reward.status)}>{rewardStatusLabel(reward.status)}</Badge>
                    {reward.reviews.length > 0 ? (
                      <details className="mt-1.5 text-xs text-muted-foreground">
                        <summary className="w-fit cursor-pointer">Historique</summary>
                        <ul className="mt-2 grid max-w-52 gap-2 whitespace-normal">
                          {reward.reviews.map((review) => (
                            <li key={review.id}>
                              <p className="text-foreground">{rewardStatusLabel(review.result)}{review.reason ? ` · ${review.reason}` : ""}</p>
                              <p>{review.actorName ?? "Compte introuvable"} · {reportedAtLabel(review.recordedAt)}</p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="grid justify-items-start gap-1">
                      {status.label === "—" ? <span className="text-muted-foreground">—</span> : <Badge variant={status.variant}>{status.label}</Badge>}
                      {payment?.statementReference ? (
                        canReadStatements && payment.statementId
                          ? <Link href={`/etats/${payment.statementId}`} className="ref text-xs text-primary underline-offset-2 hover:underline">{payment.statementReference}</Link>
                          : <span className="ref text-xs text-muted-foreground">{payment.statementReference}</span>
                      ) : null}
                      {payment?.transferReference ? <span className="ref text-xs text-muted-foreground">{payment.transferReference}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {candidate ? <Dialog.Trigger render={<Button size="sm" />} onClick={() => setTargets([candidate])}>Payer</Dialog.Trigger> : null}
                      {canReview && reward.status === "proposed" ? (
                        <ActionDialog label="Examiner" title="Examiner la récompense" description={francs(reward.amount)} size="sm">
                          <ReviewRewardForm rewardId={reward.id} />
                        </ActionDialog>
                      ) : null}
                      {canVerify && payment?.transferId ? <TransferCheckForm id={payment.transferId} statementId={payment.statementId ?? undefined} /> : null}
                      {!candidate && !(canReview && reward.status === "proposed") && !canVerify ? <span className="text-muted-foreground">—</span> : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {targets ? <RewardPaymentForm rewards={targets} environment={environment} onRunning={setRunning} onComplete={() => setSelectedIds(new Set())} /> : null}
    </Dialog.Root>
  );
}

function RewardPaymentForm({ rewards, environment, onRunning, onComplete }: {
  rewards: PayableReward[];
  environment: TransferEnvironment;
  onRunning: (running: boolean) => void;
  onComplete: () => void;
}) {
  const router = useRouter();
  const runningRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const total = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  const completed = Object.keys(outcomes).length;
  const sandbox = environment === "sandbox";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (runningRef.current || completed > 0) return;
    const data = new FormData(event.currentTarget);
    runningRef.current = true;
    setRunning(true);
    onRunning(true);
    try {
      // Each call is independently committed so a timeout on one line never repeats the others.
      for (const reward of rewards) {
        let result: Outcome;
        try {
          result = await payReward(reward.id, {
            lineId: reward.payment.lineId,
            previousTransferId: reward.payment.transferId,
            environment,
            operator: String(data.get(reward.id) ?? ""),
          });
        } catch {
          result = { state: "unknown", message: "Résultat à confirmer. Consultez le statut du versement." };
        }
        setOutcomes(current => ({ ...current, [reward.id]: result }));
      }
      onComplete();
      router.refresh();
    } finally {
      runningRef.current = false;
      setRunning(false);
      onRunning(false);
    }
  }

  return (
    <DialogSurface title={sandbox ? "Confirmer le test de paiement" : "Confirmer le paiement"} closeDisabled={running}
      description={`${rewards.length} récompense${rewards.length > 1 ? "s" : ""} · ${francs(total)}`}>
      <form className="grid gap-4" onSubmit={submit}>
        <ul className="grid divide-y rounded-md border">
          {rewards.map((reward) => {
            const outcome = outcomes[reward.id];
            const operator = sandbox ? sandboxTransferOperator(reward.phone) : undefined;
            return (
              <li key={reward.id} className="grid gap-2 p-3">
                <p className="flex flex-wrap justify-between gap-2 text-sm tabular-nums">
                  <span>{reward.phone}</span><strong>{francs(reward.amount)}</strong>
                </p>
                <label className="grid gap-1 text-xs text-muted-foreground">
                  Opérateur <span className="sr-only">pour le numéro {reward.phone}</span>
                  <NativeSelect name={reward.id} defaultValue={operator ?? ""} disabled={running || completed > 0} required>
                    <NativeSelectOption value="" disabled>Choisir un opérateur</NativeSelectOption>
                    {TRANSFER_OPERATORS.filter(([key]) => !operator || operator === key).map(([key, label]) => (
                      <NativeSelectOption key={key} value={key}>{label}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
                {outcome ? <Badge className="whitespace-normal" variant={outcome.state === "paid" ? "success" : ["failed", "rejected"].includes(outcome.state) ? "destructive" : "warning"}>{outcome.message}</Badge> : null}
              </li>
            );
          })}
        </ul>
        <p role="status" className="text-sm text-muted-foreground">
          {running ? `Traitement des versements… ${completed}/${rewards.length}` : completed > 0 ? `Résultats disponibles pour les ${completed} récompense${completed > 1 ? "s" : ""}.` : null}
        </p>
        {completed === rewards.length && !running
          ? <Dialog.Close render={<Button variant="outline" />}>Fermer</Dialog.Close>
          : <Button type="submit" disabled={running}>{sandbox ? "Lancer le test" : `Payer ${francs(total)}`}</Button>}
      </form>
    </DialogSurface>
  );
}
