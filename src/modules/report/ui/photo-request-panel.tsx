"use client";

import { useActionState } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { requestAnotherPhoto } from "@/modules/report/actions/request-another-photo";
import { linkPhotoRequest } from "@/modules/report/actions/link-photo-request";
import { sendPhotoRequest } from "@/modules/report/actions/send-photo-request";
import { reportedAtLabel, type PhotoRequest, type ReportPhoto } from "@/modules/report/model/report";

const SMS_STATES: Record<string,string> = { prepared: "SMS à envoyer", sending: "Envoi en cours", accepted: "SMS transmis", failed: "SMS non transmis", unknown: "Envoi à confirmer" };
export function PhotoRequestPanel({ reportId, photo, requests, canRequest }: { reportId: string; photo: ReportPhoto; requests: PhotoRequest[]; canRequest: boolean }) {
  const mine=requests.filter(r=>r.photoId===photo.id);
  const open=mine.find(r=>r.status==="open");
  if(!canRequest && mine.length===0) return null;
  return <section aria-labelledby={`request-${photo.id}`} className="grid gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 id={`request-${photo.id}`} className="text-[15px] font-medium">Nouvelle photo</h3>
      {canRequest && !open ? <ActionDialog label="Demander une photo" title="Demander une nouvelle photo"><RequestForm reportId={reportId} photoId={photo.id} /></ActionDialog> : null}
    </div>
    {open ? <div className="grid gap-4 border-y py-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Photo attendue</Badge><span className="text-xs text-muted-foreground">{open.referenceCode}</span></div>
      <p className="text-sm">{open.reason}</p>
      {open.messageBody ? <p className="text-sm text-muted-foreground">{open.messageBody}</p> : null}
      <p className="text-xs text-muted-foreground">{SMS_STATES[open.messageStatus || "prepared"] || "À vérifier"}</p>
      {canRequest ? <div className="flex flex-wrap items-start gap-2">
        <SendForm reportId={reportId} request={open} />
        <ActionDialog label="Rattacher la photo reçue" title="Rattacher la photo reçue" variant="outline"><LinkForm reportId={reportId} requestId={open.id} /></ActionDialog>
      </div> : null}
    </div> : null}
    {mine.some(r=>r.status!=="open") ? <details className="text-sm"><summary className="cursor-pointer py-2">Demandes terminées</summary><ul>{mine.filter(r=>r.status!=="open").map(r=><li key={r.id} className="grid gap-1 border-b py-3"><span>Photo reçue · {r.referenceCode}</span><span className="text-xs text-muted-foreground">{r.resolvedAt ? reportedAtLabel(r.resolvedAt) : ""}{r.linkedIdentifier ? ` · ${r.linkedIdentifier}` : ""}</span></li>)}</ul></details> : null}
  </section>;
}
function RequestForm({reportId,photoId}:{reportId:string;photoId:string}) {
  const [message,action,pending]=useActionState(requestAnotherPhoto,null);
  return <form action={action}><input type="hidden" name="reportId" value={reportId} /><input type="hidden" name="photoId" value={photoId} /><FieldGroup>
    <Field><FieldLabel htmlFor={`reason-${photoId}`}>Éléments à reprendre</FieldLabel><Textarea id={`reason-${photoId}`} name="reason" required maxLength={500} placeholder="Ex. NIF et numéro de facture illisibles" /></Field>
    <Button type="submit" disabled={pending}>{pending ? "Préparation…" : "Préparer la demande"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
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
    <Field><FieldLabel htmlFor={`link-${requestId}`}>Référence du nouveau signalement</FieldLabel><Input id={`link-${requestId}`} name="referenceCode" required maxLength={80} /></Field>
    <Button type="submit" disabled={pending}>{pending ? "Rattachement…" : "Rattacher et reprendre le dossier"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}
