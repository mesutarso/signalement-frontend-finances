"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
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
      <h3 id="report-duplicates" className="sr-only">Doublons</h3>
      {alerts.length === 0 ? <p className="text-sm text-muted-foreground">Aucun rapprochement à vérifier.</p> : (
        <ul className="border-t">
          {alerts.map((alert) => <li key={alert.id}><DuplicateCard reportId={reportId} alert={alert} canDecide={canDecide} /></li>)}
        </ul>
      )}
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
  const label = alert.status === "confirmed" ? "Doublon confirmé" : alert.status === "dismissed" ? "Rapprochement écarté" : duplicateStrengthLabel(alert.strength);
  return (
    <article className="grid gap-2 border-b py-4 text-sm leading-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant={alert.status === "confirmed" ? "destructive" : alert.status === "dismissed" ? "outline" : "warning"}>{label}</Badge>
        {alert.otherReportedAt ? <p className="text-[13px] text-muted-foreground">Reçu le {reportedAtLabel(alert.otherReportedAt)}</p> : null}
      </div>
      <p>{alert.explanation}</p>
      {alert.otherIdentifier ? (
        <Link href={`/signalements/${alert.otherReportId}`} className="w-fit break-all text-primary underline-offset-4 hover:underline">
          Voir le signalement <span className="ref">{alert.otherIdentifier}</span>
        </Link>
      ) : null}
      {priority ? <p className="font-medium">{priority}</p> : null}
      {alert.reason ? <p className="text-muted-foreground">Motif : {alert.reason}{alert.actorName ? ` — ${alert.actorName}` : ""}</p> : null}
      {canDecide && alert.status === "open" ? (
        <form action={action} className="mt-2 grid gap-3">
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
                rows={2}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground md:text-[15px]"
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
