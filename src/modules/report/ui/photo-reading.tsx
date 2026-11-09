"use client";

import { useActionState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
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
    <section aria-labelledby={`reading-${photo.id}`} className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <h3 id={`reading-${photo.id}`} className="text-[15px] font-bold">Lecture de la pièce</h3>
          {reading?.status === "READ" ? <p className="text-[13px] text-muted-foreground">Qualité {qualityLabel(reading.quality).toLowerCase()} · confiance {confidenceLabel(reading.confidence)}</p> : null}
        </div>
        {canRequest ? (
          <form action={action}>
            <input type="hidden" name="reportId" value={reportId} />
            <input type="hidden" name="photoId" value={photo.id} />
            <input type="hidden" name="refresh" value={reading ? "true" : "false"} />
            <Button type="submit" variant="outline" size="sm" disabled={pending}>
              {pending ? "Lecture en cours…" : reading ? "Relancer la lecture" : "Lire la pièce"}
            </Button>
          </form>
        ) : null}
      </div>
      {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
      {!reading ? <p role="status" className="text-sm text-muted-foreground">Cette pièce n’a pas encore été lue.</p> : null}
      {reading?.status === "FAILED" ? <p role="status" className="text-sm text-muted-foreground">{readingErrorLabel(reading.errorCode)}</p> : null}
      {reading?.status === "READ" ? <ReadingFields reading={reading} /> : null}
      {reading?.status === "READ" && canRequest ? <p className="text-[13px] leading-5 text-muted-foreground">Une relance effectue une nouvelle analyse. La lecture précédente reste conservée.</p> : null}
    </section>
  );
}

function ReadingFields({ reading }: { reading: NonNullable<ReportPhoto["reading"]> }) {
  const rows = [
    ["Vendeur", reading.sellerName],
    ["NIF", reading.sellerTaxId],
    ["Date", reading.documentDate],
    ["Numéro", reading.documentNumber],
    ["Total TTC", reading.amount],
    ["Devise", reading.currency],
    ["Montant HT", reading.netAmount],
    ["TVA", reading.vatAmount],
    ["Taux de TVA", reading.vatRate],
    ["Montant payé", reading.paidAmount],
    ["Code de vérification", reading.code],
    ["Code DEF", reading.defCode],
    ["Numéro DEF", reading.defNumber],
  ] as const;
  return (
    <div className="grid gap-4">
      <dl className="grid gap-x-8 border-t sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 border-b py-2">
            <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
            <dd className={cn("min-w-0 text-right text-sm break-words tabular-nums", value && value.trim() ? "font-medium" : "text-muted-foreground")}>{readValue(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-1">
        <h4 className="text-[13px] text-muted-foreground">Articles</h4>
        {reading.articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun article lu.</p>
        ) : (
          <ul className="border-t text-sm">
            {reading.articles.map((article, index) => (
              <li key={`${article.designation ?? ""}-${index}`} className="flex flex-wrap justify-between gap-x-4 border-b py-2">
                <span className="break-words">{readValue(article.designation)}</span>
                <span className="font-medium tabular-nums">{readValue(article.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-[13px] leading-5 text-muted-foreground">{readingProviderLabel(reading.model)} · Informations extraites à vérifier sur la pièce.</p>
    </div>
  );
}
