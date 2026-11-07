"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { decideDuplicate } from "@/modules/report/actions/decide-duplicate";
import {
  duplicatePriorityLabel,
  duplicateStrengthLabel,
  reportedAtLabel,
  type DuplicateAlert,
} from "@/modules/report/model/report";

export function DuplicateAlerts({
  reportId,
  alerts,
  canDecide,
}: {
  reportId: string;
  alerts: DuplicateAlert[];
  canDecide: boolean;
}) {
  return (
    <section aria-labelledby="report-duplicates" className="grid gap-4">
      <h3 id="report-duplicates" className="text-sm font-bold">Doublons</h3>
      {alerts.length === 0 ? <p className="text-sm text-muted-foreground">Aucun rapprochement à vérifier.</p> : null}
      {alerts.map((alert) => <DuplicateCard key={alert.id} reportId={reportId} alert={alert} canDecide={canDecide} />)}
    </section>
  );
}

function DuplicateCard({
  reportId,
  alert,
  canDecide,
}: {
  reportId: string;
  alert: DuplicateAlert;
  canDecide: boolean;
}) {
  const [message, action, pending] = useActionState(decideDuplicate, null);
  const priority = duplicatePriorityLabel(alert);
  return (
    <article className="grid gap-3 rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{alert.status === "confirmed" ? "Doublon confirmé" : alert.status === "dismissed" ? "Rapprochement écarté" : duplicateStrengthLabel(alert.strength)}</p>
        {alert.otherReportedAt ? <p className="text-xs text-muted-foreground">Reçu le {reportedAtLabel(alert.otherReportedAt)}</p> : null}
      </div>
      <p>{alert.explanation}</p>
      {alert.otherIdentifier ? (
        <Link href={`/signalements/${alert.otherReportId}`} className="w-fit break-all text-primary underline-offset-4 hover:underline">
          Voir le signalement {alert.otherIdentifier}
        </Link>
      ) : null}
      {priority ? <p className="font-bold">{priority}</p> : null}
      {alert.reason ? <p className="text-muted-foreground">Motif : {alert.reason}{alert.actorName ? ` — ${alert.actorName}` : ""}</p> : null}
      {canDecide && alert.status === "open" ? (
        <form action={action} className="grid gap-3">
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="alertId" value={alert.id} />
          <input type="hidden" name="otherReportId" value={alert.otherReportId} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`duplicate-reason-${alert.id}`}>Motif</FieldLabel>
              <textarea
                id={`duplicate-reason-${alert.id}`}
                name="reason"
                required
                maxLength={500}
                rows={3}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--fin-focus)]"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="decision" value="confirm" disabled={pending}>Confirmer le doublon</Button>
              <Button type="submit" name="decision" value="dismiss" variant="outline" disabled={pending}>Écarter</Button>
            </div>
            {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
          </FieldGroup>
        </form>
      ) : null}
    </article>
  );
}
