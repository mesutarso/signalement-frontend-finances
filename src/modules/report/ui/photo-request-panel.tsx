"use client";

import { useActionState } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { linkPhotoRequest } from "@/modules/report/actions/link-photo-request";
import { requestAnotherPhoto } from "@/modules/report/actions/request-another-photo";
import {
  photoRequestBasisLabel,
  photoRequestStatusLabel,
  reportedAtLabel,
  type PhotoRequest,
  type ReportPhoto,
} from "@/modules/report/model/report";

export function PhotoRequestPanel({
  reportId,
  photo,
  requests,
  canRequest,
}: {
  reportId: string;
  photo: ReportPhoto;
  requests: PhotoRequest[];
  canRequest: boolean;
}) {
  const mine = requests.filter((request) => request.photoId === photo.id);
  const open = mine.find((request) => request.status === "open");
  return (
    <section aria-labelledby={`request-${photo.id}`} className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`request-${photo.id}`} className="text-[15px] font-bold">Nouvelle photo</h3>
        {canRequest && !open ? <ActionDialog label="Demander une nouvelle photo" title="Demander une nouvelle photo" size="sm"><RequestForm reportId={reportId} photoId={photo.id} /></ActionDialog> : null}
        {canRequest && open ? <ActionDialog label="Rattacher la nouvelle pièce" title="Rattacher la nouvelle pièce" size="sm"><LinkForm reportId={reportId} requestId={open.id} /></ActionDialog> : null}
      </div>
      {mine.length === 0 ? <p className="text-sm text-muted-foreground">Aucune demande pour cette pièce.</p> : (
        <ul className="border-t">
          {mine.map((request) => (
            <li key={request.id} className="grid gap-1 border-b py-3.5 text-sm leading-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={request.status === "open" ? "warning" : "success"}>{photoRequestStatusLabel(request.status)}</Badge>
                <p className="ref text-muted-foreground">{request.referenceCode}</p>
              </div>
              <p>{request.reason}</p>
              <p className="text-[13px] leading-5 text-muted-foreground">
                {photoRequestBasisLabel(request.basis)} Demandée le {reportedAtLabel(request.createdAt)}
                {request.actorName ? ` par ${request.actorName}` : ""}.
                {request.notice === "waiting" ? " Le message est préparé. Il n\u2019est pas envoyé." : ""}
              </p>
              {request.linkedIdentifier ? <p>Signalement rattaché : <span className="ref">{request.linkedIdentifier}</span></p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RequestForm({ reportId, photoId }: { reportId: string; photoId: string }) {
  const [message, action, pending] = useActionState(requestAnotherPhoto, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="photoId" value={photoId} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`reason-${photoId}`}>Motif</FieldLabel>
          <textarea
            id={`reason-${photoId}`}
            name="reason"
            required
            maxLength={500}
            rows={3}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground"
            placeholder="Décrivez pourquoi la pièce est illisible"
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Demander une nouvelle photo"}
        </Button>
        {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}

function LinkForm({ reportId, requestId }: { reportId: string; requestId: string }) {
  const [message, action, pending] = useActionState(linkPhotoRequest, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="requestId" value={requestId} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`link-${requestId}`}>Référence du signalement reçu</FieldLabel>
          <input
            id={`link-${requestId}`}
            name="referenceCode"
            required
            maxLength={80}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground"
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Rattachement…" : "Rattacher la nouvelle pièce"}
        </Button>
        {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
