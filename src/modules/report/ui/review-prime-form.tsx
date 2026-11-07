"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { reviewPrime } from "@/modules/report/actions/review-prime";

export function ReviewPrimeForm({ primeId, reportId }: { primeId: string; reportId?: string }) {
  const [approval, approve, approving] = useActionState(reviewPrime, null);
  const [returned, sendBack, returning] = useActionState(reviewPrime, null);
  return (
    <div className="grid gap-4">
      <form action={approve} className="grid gap-3">
        <input type="hidden" name="primeId" value={primeId} />
        {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
        <input type="hidden" name="result" value="approved" />
        <p className="text-sm text-muted-foreground">Le paiement nécessite une action distincte.</p>
        <Button type="submit" disabled={approving || returning}>Approuver la prime</Button>
        {approval ? <p role="status" className="text-sm font-bold text-primary">{approval}</p> : null}
      </form>
      <form action={sendBack} className="grid gap-3">
        <input type="hidden" name="primeId" value={primeId} />
        {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
        <input type="hidden" name="result" value="returned" />
        <Field>
          <FieldLabel htmlFor={`prime-reason-${primeId}`}>Motif du renvoi</FieldLabel>
          <textarea id={`prime-reason-${primeId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
        </Field>
        <Button type="submit" variant="outline" disabled={approving || returning}>Renvoyer la prime</Button>
        {returned ? <p role="status" className="text-sm font-bold text-primary">{returned}</p> : null}
      </form>
    </div>
  );
}
