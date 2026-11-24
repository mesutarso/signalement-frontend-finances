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
  reportedAt,
}: {
  reportId: string;
  alerts: DuplicateAlert[];
  canDecide: boolean;
  reportedAt: string;
}) {
  return (
    <section aria-labelledby="report-duplicates" className="grid gap-2 border-t border-foreground pt-3.5">
      <h2 id="report-duplicates" tabIndex={-1} className="scroll-mt-20 text-[15px] font-bold">Doublons</h2>
      <ul>
        {alerts.map((alert) => <li key={alert.id}><DuplicateCard reportId={reportId} alert={alert} canDecide={canDecide} reportedAt={reportedAt} /></li>)}
      </ul>
    </section>
  );
}

function DuplicateCard({
  reportId,
  alert,
  canDecide,
  reportedAt,
}: {
  reportId: string;
  alert: DuplicateAlert;
  canDecide: boolean;
  reportedAt: string;
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
      {alert.currentReporterName || alert.currentReporterPhone || alert.otherReporterName || alert.otherReporterPhone ? <section className="grid gap-2" aria-label="Déclarants des signalements">
        <h4 className="font-medium">{alert.differentDeclarants && alert.status === "confirmed" ? "Même facture, deux déclarants" : "Signalements à comparer"}</h4>
        <ol className="grid gap-3">{[
          {id:reportId,date:reportedAt,name:alert.currentReporterName,phone:alert.currentReporterPhone},
          {id:alert.otherReportId,date:alert.otherReportedAt,name:alert.otherReporterName,phone:alert.otherReporterPhone},
        ].sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(item=><li key={item.id} className="grid gap-1 border-b pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{item.name || "Déclarant non renseigné"}</span>{alert.status === "confirmed" ? <Badge variant="outline">{item.id===alert.priorityReportId ? "Premier conservé" : "Rejeté"}</Badge> : null}</div>
          {item.phone ? <span className="text-muted-foreground">{item.phone}</span> : null}
          {item.date ? <span className="text-xs text-muted-foreground">{reportedAtLabel(item.date)}</span> : null}
        </li>)}</ol>
      </section> : null}
      <p>{alert.explanation}</p>
      {alert.otherIdentifier ? (
        <Button className="w-fit" variant="outline" size="sm" nativeButton={false} render={<Link href={`/signalements/${alert.otherReportId}`} />}>
          Voir l’autre signalement
        </Button>
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
