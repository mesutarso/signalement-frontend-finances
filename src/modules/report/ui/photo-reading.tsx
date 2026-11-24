import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import {
  readValue,
  readingErrorLabel,
  type ReportPhoto,
} from "@/modules/report/model/report";

export function PhotoReading({ photo, pieceNumber, loading }: { photo: ReportPhoto; pieceNumber?: number; loading: boolean }) {
  const reading = photo.reading;
  return (
    <section aria-label="Données extraites par l’OCR" className="grid gap-3">
      {pieceNumber ? <h2 className="text-sm font-medium">Données OCR de la pièce {pieceNumber}</h2> : null}
      {!reading && loading ? (
        <div role="status" className="grid gap-2">
          <span className="sr-only">Lecture de la pièce</span>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : null}
      {!reading && !loading ? <p className="text-sm text-muted-foreground">Aucune donnée OCR pour cette pièce.</p> : null}
      {reading?.status === "FAILED" ? <p className="text-sm text-muted-foreground">{readingErrorLabel(reading.errorCode)}</p> : null}
      {reading?.status === "READ" ? <ReadingFields reading={reading} /> : null}
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
    </div>
  );
}
