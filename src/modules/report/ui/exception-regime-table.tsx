"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { DialogSurface } from "@/components/action-dialog";
import { TablePagination } from "@/components/table-pagination";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { authorizeExceptionPayment, readExceptionCandidates, validateExceptionPeriod } from "@/modules/report/actions/exception-regime";
import type { ExceptionCandidate, ExceptionOrder, ExceptionPage, ExceptionPayment, ExceptionPeriod } from "@/modules/report/model/exception-regime";
import { calendarLabel, findingLabel } from "@/modules/report/model/report";
import { francs } from "@/modules/report/model/reward";
import { sandboxTransferOperator, TRANSFER_OPERATORS, type TransferOperator } from "@/modules/report/model/transfer";

const validationLabels: Record<string, string> = {
  queued: "En attente", analyzing: "En analyse", doubt: "À vérifier", validated: "Validé",
  rejected: "Rejeté", legacy: "Historique",
};
const paymentLabels: Record<string, string> = {
  unvalidated: "En attente de validation", reward: "Récompense indisponible", duplicate: "Doublon à traiter",
  "standard-statement": "Dans un état de paiement", identity: "Identité à vérifier", suspended: "Bénéficiaire suspendu",
  phone: "Numéro à vérifier", "legacy-reward": "Ancien régime à vérifier", amount: "Montant hors limite", "test-wallet": "Numéro hors mode test",
  ready: "À payer", queued: "En file d’envoi", submitting: "En cours", pending: "En cours",
  unknown: "À confirmer", paid: "Payé", "test-paid": "Test réussi", failed: "Échec Araka", blocked: "Envoi bloqué",
};
const number = new Intl.NumberFormat("fr-FR");

type Notice = { error?: boolean; text: string };

function PeriodLabel({ start, end }: ExceptionPeriod) {
  if (start && end) return <>Du {calendarLabel(start)} au {calendarLabel(end)}</>;
  if (start) return <>À partir du {calendarLabel(start)}</>;
  if (end) return <>Jusqu’au {calendarLabel(end)}</>;
  return <>Toutes les dates</>;
}

function NoticeAlert({ notice }: { notice: Notice }) {
  return <Alert variant={notice.error ? "destructive" : "default"} role={notice.error ? "alert" : "status"}><AlertTitle>{notice.text}</AlertTitle></Alert>;
}

export function ExceptionRegimeTable({ data, period }: { data: ExceptionPage; period: ExceptionPeriod }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dialog, setDialog] = useState<"validate" | "pay" | null>(null);
  const [candidates, setCandidates] = useState<ExceptionCandidate[]>([]);
  const [loading, startLoading] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const refresh = () => startRefresh(() => router.refresh());

  function openPayment() {
    setNotice(null);
    startLoading(async () => {
      const outcome = await readExceptionCandidates(period);
      if (!outcome.ok) {
        setNotice({ error: true, text: outcome.message });
      } else if (!outcome.body.length) {
        setNotice({ text: "Aucun signalement de cette période ne réunit les conditions de paiement." });
      } else {
        setCandidates(outcome.body);
        setDialog("pay");
      }
    });
  }

  function finish(text: string) {
    setDialog(null);
    setNotice({ text });
    refresh();
  }

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{number.format(data.total)} signalement{data.total === 1 ? "" : "s"}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" disabled={refreshing} onClick={refresh}>Actualiser</Button>
          <Button variant="outline" disabled={data.validatable === 0 || loading || refreshing}
            onClick={() => { setNotice(null); setDialog("validate"); }}>Valider en bloc</Button>
          <Button onClick={openPayment} disabled={!data.configured || data.total === 0 || loading || refreshing}>
            {loading ? "Chargement…" : "Payer en bloc"}
          </Button>
        </div>
      </div>
      {!data.configured && <NoticeAlert notice={{ error: true, text: "Le service de versement Araka est indisponible." }} />}
      {notice && <NoticeAlert notice={notice} />}
      <Table aria-label="Signalements du régime d’exception">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead scope="col">Signalement</TableHead>
            <TableHead scope="col">Date du dépôt</TableHead>
            <TableHead scope="col">Déclarant</TableHead>
            <TableHead scope="col">Validation</TableHead>
            <TableHead scope="col">Catégorie / motif</TableHead>
            <TableHead scope="col" className="text-right">Récompense</TableHead>
            <TableHead scope="col">Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link className="font-medium text-primary hover:underline" href={`/signalements/${row.id}`}>Ouvrir le signalement</Link>
                {row.company && <p className="max-w-44 truncate text-xs text-muted-foreground" title={row.company}>{row.company}</p>}
              </TableCell>
              <TableCell>{calendarLabel(row.date)}</TableCell>
              <TableCell><span className="block max-w-44 truncate" title={row.declarant ?? undefined}>{row.declarant || "—"}</span></TableCell>
              <TableCell>
                <Badge variant={row.state === "validated" ? "success" : row.state === "rejected" ? "destructive" : row.state === "doubt" ? "warning" : "secondary"}>
                  {validationLabels[row.state] ?? row.state}
                </Badge>
              </TableCell>
              <TableCell className="min-w-48 max-w-72 whitespace-normal">
                {row.state === "validated" && row.finding && <p className="font-medium">{findingLabel(row.finding)}</p>}
                {row.reason ? <p className="text-xs text-muted-foreground">{row.reason}</p> : row.state !== "validated" || !row.finding ? "—" : null}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{row.amount == null ? "—" : francs(row.amount)}</TableCell>
              <TableCell>
                <Badge variant={row.paymentState === "paid" ? "success" : ["failed", "blocked"].includes(row.paymentState) ? "destructive"
                  : ["ready", "test-paid", "queued", "submitting", "pending"].includes(row.paymentState) ? "secondary"
                  : row.paymentState === "unvalidated" ? "outline" : "warning"}>
                  {paymentLabels[row.paymentState] ?? row.paymentState}
                </Badge>
                {row.paymentReference && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.paymentReference}</p>}
              </TableCell>
            </TableRow>
          ))}
          {!data.items.length && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Aucun signalement pour cette période.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <TablePagination page={data.page} size={data.size} total={data.total} label="Pagination des signalements du régime d’exception" />
      {dialog === "validate" && <ValidateDialog period={period} count={data.validatable} close={() => setDialog(null)} finish={finish} />}
      {dialog === "pay" && <PayDialog period={period} candidates={candidates} environment={data.environment} close={() => setDialog(null)} finish={finish} />}
    </div>
  );
}

function ValidateDialog({ period, count, close, finish }: { period: ExceptionPeriod; count: number; close: () => void; finish: (text: string) => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await validateExceptionPeriod(period, reason.trim());
      if (!result.ok) setError(result.message);
      else if (result.body) {
        const { validated, skipped } = result.body;
        const changed = validated === 1 ? "1 signalement validé." : `${number.format(validated)} signalements validés.`;
        const other = skipped === 1 ? "1 dossier écarté." : `${number.format(skipped)} dossiers écartés.`;
        finish(skipped ? `${changed} ${other}` : changed);
      }
    });
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !pending) close(); }}>
      <DialogSurface title="Valider les signalements en bloc" closeDisabled={pending}
        description={<><PeriodLabel {...period} /> · {number.format(count)} dossiers à examiner</>}>
        <form className="grid gap-4" onSubmit={submit}>
          <p className="text-sm text-muted-foreground">La décision et son motif seront inscrits dans chaque dossier validé.</p>
          <Field>
            <FieldLabel htmlFor="exception-validation-reason">Motif de validation exceptionnelle</FieldLabel>
            <Textarea id="exception-validation-reason" required maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
          {error && <NoticeAlert notice={{ error: true, text: error }} />}
          <div className="flex flex-wrap justify-end gap-2">
            <Dialog.Close disabled={pending} render={<Button variant="outline" />}>Annuler</Dialog.Close>
            <Button type="submit" disabled={pending || !reason.trim()}>{pending ? "Validation…" : "Confirmer la validation"}</Button>
          </div>
        </form>
      </DialogSurface>
    </Dialog.Root>
  );
}

function PayDialog({ period, candidates, environment, close, finish }: {
  period: ExceptionPeriod; candidates: ExceptionCandidate[]; environment: ExceptionPage["environment"];
  close: () => void; finish: (text: string) => void;
}) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [operators, setOperators] = useState<Partial<Record<string, TransferOperator>>>({});
  const [defaultOperator, setDefaultOperator] = useState<TransferOperator | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<ExceptionPayment | null>(null);
  const [pending, startTransition] = useTransition();

  function operatorFor(row: ExceptionCandidate) {
    return environment === "sandbox" ? sandboxTransferOperator(row.phone) ?? "" : operators[row.id] ?? defaultOperator;
  }

  const selected = candidates.filter((row) => !excluded.has(row.id));
  const total = selected.reduce((sum, row) => sum + row.amount, 0);
  const lockForm = pending || attempt !== null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const orders: ExceptionOrder[] = selected.flatMap((row) => {
      const operator = operatorFor(row);
      return operator ? [{ id: row.id, lineId: row.lineId, previousTransferId: row.previousTransferId, amount: row.amount, phone: row.phone, operator }] : [];
    });
    if (!attempt && (!orders.length || orders.length !== selected.length)) return;
    const request = attempt ?? { requestId: crypto.randomUUID(), environment, reason: reason.trim(), orders };
    setAttempt(request);
    setError("");
    startTransition(async () => {
      const result = await authorizeExceptionPayment(request);
      if (!result.ok) {
        setError(result.message);
        if (result.status >= 400 && result.status < 500) setAttempt(null);
      } else if (result.body) {
        const { count, total } = result.body;
        finish(`Lot autorisé et mis en file d’envoi · ${number.format(count)} versement${count === 1 ? "" : "s"} · ${francs(total)}.`);
      }
    });
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !pending) close(); }}>
      <DialogSurface title={environment === "sandbox" ? "Autoriser un lot de test" : "Autoriser un paiement exceptionnel"}
        closeDisabled={pending} description={<><PeriodLabel {...period} /> · {number.format(candidates.length)} dossiers payables</>}>
        <form className="grid gap-4" onSubmit={submit}>
          {environment === "production" && (
            <Field>
              <FieldLabel htmlFor="exception-default-operator">Opérateur par défaut du lot</FieldLabel>
              <select id="exception-default-operator" className="min-h-10 rounded-md border bg-background px-2 text-sm"
                disabled={lockForm} value={defaultOperator} onChange={(event) => setDefaultOperator(event.target.value as TransferOperator | "")}>
                <option value="">Choisir dossier par dossier</option>
                {TRANSFER_OPERATORS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </Field>
          )}
          <fieldset className="grid min-w-0 gap-2" disabled={lockForm}>
            <legend className="mb-2 text-sm font-medium">Versements à inclure</legend>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium tabular-nums">{number.format(selected.length)} sélectionnés · {francs(total)}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setExcluded(excluded.size ? new Set() : new Set(candidates.map((row) => row.id)))}>
                {excluded.size ? "Tout sélectionner" : "Tout désélectionner"}
              </Button>
            </div>
            <ul className="max-h-60 divide-y overflow-y-auto rounded-md border">
              {candidates.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                  <label className="flex min-w-0 items-center gap-2.5">
                    <input type="checkbox" className="size-4 shrink-0 accent-primary" checked={!excluded.has(row.id)} onChange={(event) => {
                      const checked = event.target.checked;
                      setExcluded((current) => {
                        const next = new Set(current);
                        if (checked) next.delete(row.id);
                        else next.add(row.id);
                        return next;
                      });
                    }} />
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium">{row.declarant || "Déclarant non renseigné"} · {calendarLabel(row.date)}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">{row.phone} · {francs(row.amount)}</span>
                    </span>
                  </label>
                  {environment === "sandbox" ? <span className="text-xs text-muted-foreground">{TRANSFER_OPERATORS.find(([id]) => id === operatorFor(row))?.[1]}</span> : (
                    <select aria-label={`Opérateur pour le numéro ${row.phone}`} className="min-h-9 max-w-full rounded-md border bg-background px-2 text-xs"
                      disabled={excluded.has(row.id)} value={operators[row.id] ?? ""} onChange={(event) => {
                        const operator = event.target.value as TransferOperator | "";
                        setOperators((current) => ({ ...current, [row.id]: operator || undefined }));
                      }}>
                      <option value="">{TRANSFER_OPERATORS.find(([id]) => id === defaultOperator)?.[1] ?? "Choisir l’opérateur"}</option>
                      {TRANSFER_OPERATORS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                    </select>
                  )}
                </li>
              ))}
            </ul>
          </fieldset>
          <Field>
            <FieldLabel htmlFor="exception-payment-reason">Motif d’autorisation exceptionnelle</FieldLabel>
            <Textarea id="exception-payment-reason" required disabled={lockForm} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
          </Field>
          {error && <NoticeAlert notice={{ error: true, text: error }} />}
          <div className="flex flex-wrap justify-end gap-2">
            <Dialog.Close disabled={pending} render={<Button variant="outline" />}>Fermer</Dialog.Close>
            <Button type="submit" disabled={pending || (!attempt && (!reason.trim() || !selected.length || selected.some((row) => !operatorFor(row))))}>
              {pending ? "Autorisation…" : attempt ? "Réessayer le même lot" : environment === "sandbox" ? "Autoriser le lot de test" : "Autoriser et payer"}
            </Button>
          </div>
        </form>
      </DialogSurface>
    </Dialog.Root>
  );
}
