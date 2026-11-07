"use client";

import { useActionState } from "react";
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
    <section aria-labelledby={`request-${photo.id}`} className="grid gap-4 rounded-lg border p-4">
      <h3 id={`request-${photo.id}`} className="text-sm font-bold">
        Nouvelle photo
      </h3>
      {mine.length === 0 ? <p className="text-sm text-muted-foreground">Aucune demande pour cette pièce.</p> : null}
      {mine.map((request) => (
        <article key={request.id} className="grid gap-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">{photoRequestStatusLabel(request.status)}</p>
            <p className="text-xs text-muted-foreground">{request.referenceCode}</p>
          </div>
          <p>{request.reason}</p>
          <p className="text-xs text-muted-foreground">
            {photoRequestBasisLabel(request.basis)} Demandée le {reportedAtLabel(request.createdAt)}
            {request.actorName ? ` par ${request.actorName}` : ""}.
          </p>
          {request.notice === "waiting" ? (
            <p className="text-xs text-muted-foreground">Déclarant à prévenir.</p>
          ) : null}
          {request.linkedIdentifier ? (
            <p>Signalement rattaché : {request.linkedIdentifier}</p>
          ) : null}
        </article>
      ))}
      {canRequest && !open ? <RequestForm reportId={reportId} photoId={photo.id} /> : null}
      {canRequest && open ? <LinkForm reportId={reportId} requestId={open.id} /> : null}
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
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--fin-focus)]"
            placeholder="Décrivez pourquoi la pièce est illisible"
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending} className="w-fit">
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
            className="h-12 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--fin-focus)]"
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending} className="w-fit">
          {pending ? "Rattachement…" : "Rattacher la nouvelle pièce"}
        </Button>
        {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
