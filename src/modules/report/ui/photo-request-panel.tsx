"use client";

import { useActionState } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { ReportPicker } from "@/modules/report/ui/report-picker";
import { linkPhotoRequest } from "@/modules/report/actions/link-photo-request";
import { sendPhotoRequest } from "@/modules/report/actions/send-photo-request";
import { reportedAtLabel, type PhotoRequest, type ReportPhoto } from "@/modules/report/model/report";

const SMS_STATES: Record<string,string> = { prepared: "SMS à envoyer", sending: "Envoi en cours", accepted: "SMS transmis", failed: "SMS non transmis", unknown: "Envoi à confirmer" };
export function PhotoRequestPanel({ reportId, photo, requests, canRequest }: { reportId: string; photo: ReportPhoto; requests: PhotoRequest[]; canRequest: boolean }) {
  const mine=requests.filter(r=>r.photoId===photo.id);
  const open=mine.find(r=>r.status==="open");
  const completed = mine.filter(request => request.status !== "open");
  if (mine.length === 0) return null;
  return <section aria-labelledby={`request-${photo.id}`} className="grid gap-3">
    <h3 id={`request-${photo.id}`} className="text-[15px] font-medium">Suivi des demandes de photo</h3>
    {open ? <div className="grid gap-4 border-y py-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Photo attendue</Badge><span className="text-xs text-muted-foreground">Code de la demande {open.referenceCode}</span></div>
      <p className="text-sm">{open.reason}</p>
      {open.messageBody ? <p className="text-sm text-muted-foreground">{open.messageBody}</p> : null}
      <p className="text-xs text-muted-foreground">{SMS_STATES[open.messageStatus || "prepared"] || "À vérifier"}</p>
      {canRequest ? <div className="flex flex-wrap items-start gap-2">
        <SendForm reportId={reportId} request={open} />
        <ActionDialog label="Rattacher la photo reçue" title="Rattacher la photo reçue" variant="outline"><LinkForm reportId={reportId} requestId={open.id} /></ActionDialog>
      </div> : null}
    </div> : null}
    {completed.length > 0 ? <section className="grid gap-1 text-sm">
      <h4 className="font-medium">Demandes terminées</h4>
      <ul>{completed.map(request => <li key={request.id} className="grid gap-1 border-b py-3">
        <span>Photo reçue</span>
        {request.resolvedAt ? <span className="text-xs text-muted-foreground">{reportedAtLabel(request.resolvedAt)}</span> : null}
      </li>)}</ul>
    </section> : null}
  </section>;
}
function SendForm({reportId,request}:{reportId:string;request:PhotoRequest}) {
  const [message,action,pending]=useActionState(sendPhotoRequest,null);
  const sendable=request.messageStatus==="prepared" || request.messageStatus==="failed";
  return <form action={action} className="grid gap-2"><input type="hidden" name="reportId" value={reportId} /><input type="hidden" name="requestId" value={request.id} />
    <Button type="submit" disabled={pending || !sendable}>{pending ? "Envoi…" : request.messageStatus==="accepted" ? "SMS transmis" : "Envoyer le SMS"}</Button>
    {message ? <p role="status" className="max-w-64 text-sm">{message}</p> : null}
  </form>;
}
function LinkForm({reportId,requestId}:{reportId:string;requestId:string}) {
  const [message,action,pending]=useActionState(linkPhotoRequest,null);
  return <form action={action}><input type="hidden" name="reportId" value={reportId} /><input type="hidden" name="requestId" value={requestId} /><FieldGroup>
    <ReportPicker name="referenceCode" label="Nouveau signalement" excludeId={reportId} />
    <Button type="submit" disabled={pending}>{pending ? "Rattachement…" : "Rattacher et reprendre le dossier"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}
