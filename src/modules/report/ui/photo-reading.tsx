"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { requestPhotoReading } from "@/modules/report/actions/request-photo-reading";
import {
  confidenceLabel,
  qualityLabel,
  readValue,
  readingErrorLabel,
  readingProviderLabel,
  type ReportPhoto,
} from "@/modules/report/model/report";

export function PhotoReading({
  reportId,
  photo,
  canRequest,
}: {
  reportId: string;
  photo: ReportPhoto;
  canRequest: boolean;
}) {
  const [message, action, pending] = useActionState(requestPhotoReading, null);
  const reading = photo.reading;
  return (
    <section aria-labelledby={`reading-${photo.id}`} className="grid gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`reading-${photo.id}`} className="text-sm font-bold">
          Lecture de la pièce
        </h3>
        {reading?.status === "READ" ? (
          <p className="text-xs text-muted-foreground">Qualité : {qualityLabel(reading.quality)}</p>
        ) : null}
      </div>
      {!reading ? <p role="status" className="text-sm text-muted-foreground">Cette pièce n’a pas encore été lue.</p> : null}
      {reading?.status === "FAILED" ? <p role="status" className="text-sm text-muted-foreground">{readingErrorLabel(reading.errorCode)}</p> : null}
      {reading?.status === "READ" ? <ReadingFields reading={reading} /> : null}
      {canRequest ? (
        <form action={action}>
          <FieldGroup>
            <Field>
              <input type="hidden" name="reportId" value={reportId} />
              <input type="hidden" name="photoId" value={photo.id} />
              <input type="hidden" name="refresh" value={reading ? "true" : "false"} />
              <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-fit">
                {pending ? "Lecture en cours…" : reading ? "Relancer la lecture" : "Lire la pièce"}
              </Button>
              {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
              {reading?.status === "READ" ? <p className="text-xs text-muted-foreground">Une relance effectue une nouvelle analyse. La lecture précédente reste conservée.</p> : null}
            </Field>
          </FieldGroup>
        </form>
      ) : null}
    </section>
  );
}

function ReadingFields({ reading }: { reading: NonNullable<ReportPhoto["reading"]> }) {
  const rows = [
    ["Vendeur", reading.sellerName],
    ["NIF", reading.sellerTaxId],
    ["Date", reading.documentDate],
    ["Total TTC", reading.amount],
    ["Devise", reading.currency],
    ["Montant HT", reading.netAmount],
    ["TVA", reading.vatAmount],
    ["Taux de TVA", reading.vatRate],
    ["Montant payé", reading.paidAmount],
    ["Numéro", reading.documentNumber],
    ["Code de vérification", reading.code],
    ["Code DEF", reading.defCode],
    ["Numéro DEF", reading.defNumber],
  ] as const;
  return (
    <div className="grid gap-4">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words font-bold">{readValue(value)}</dd>
          </div>
        ))}
        <div className="grid gap-1">
          <dt className="text-xs text-muted-foreground">Confiance estimée</dt>
          <dd className="font-bold">{confidenceLabel(reading.confidence)}</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">{readingProviderLabel(reading.model)} · Informations extraites à vérifier sur la pièce.</p>
      <div className="grid gap-2">
        <h4 className="text-xs text-muted-foreground">Articles</h4>
        {reading.articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun article lu.</p>
        ) : (
          <ul className="flex flex-col divide-y text-sm">
            {reading.articles.map((article, index) => (
              <li key={`${article.designation ?? ""}-${index}`} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="break-words">{readValue(article.designation)}</span>
                <span className="font-bold">{readValue(article.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
