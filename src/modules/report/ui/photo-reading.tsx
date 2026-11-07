"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { requestPhotoReading } from "@/modules/report/actions/request-photo-reading";
import {
  confidenceLabel,
  qualityLabel,
  readValue,
  type ReportPhoto,
} from "@/modules/report/model/report";

const UNAVAILABLE = "Lecture indisponible. Consultez la pièce jointe.";

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
  const unavailable = !reading || (reading.status !== "READ" && reading.errorCode === "unavailable");
  const failed = reading?.status === "FAILED" && reading.errorCode !== "unavailable";
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
      {unavailable ? <p role="status" className="text-sm text-muted-foreground">{UNAVAILABLE}</p> : null}
      {failed ? <p role="status" className="text-sm text-muted-foreground">La lecture a échoué. Relancez-la.</p> : null}
      {reading?.status === "READ" ? <ReadingFields reading={reading} /> : null}
      {canRequest ? (
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="photoId" value={photo.id} />
          <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-fit">
            {pending ? "Lecture en cours…" : reading ? "Relancer la lecture" : "Lire la pièce"}
          </Button>
          {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
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
    ["Montant", reading.amount],
    ["Numéro", reading.documentNumber],
    ["Code", reading.code],
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
          <dt className="text-xs text-muted-foreground">Confiance</dt>
          <dd className="font-bold">{confidenceLabel(reading.confidence)}</dd>
        </div>
      </dl>
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
