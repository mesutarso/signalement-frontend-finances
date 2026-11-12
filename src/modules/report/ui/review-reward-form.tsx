"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { reviewReward } from "@/modules/report/actions/review-reward";

export function ReviewRewardForm({ rewardId, reportId }: { rewardId: string; reportId?: string }) {
  const [approval, approve, approving] = useActionState(reviewReward, null);
  const [returned, sendBack, returning] = useActionState(reviewReward, null);
  return (
    <div className="grid gap-4">
      <form action={approve} className="grid gap-3">
        <input type="hidden" name="rewardId" value={rewardId} />
        {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
        <input type="hidden" name="result" value="approved" />
        <Button type="submit" disabled={approving || returning}>Approuver la récompense</Button>
        {approval ? <p role="status" className="text-sm font-bold text-primary">{approval}</p> : null}
      </form>
      <form action={sendBack} className="grid gap-3">
        <input type="hidden" name="rewardId" value={rewardId} />
        {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
        <input type="hidden" name="result" value="returned" />
        <Field>
          <FieldLabel htmlFor={`reward-reason-${rewardId}`}>Motif du renvoi</FieldLabel>
          <textarea id={`reward-reason-${rewardId}`} name="reason" required maxLength={500} rows={3} className="w-full rounded-md border border-input bg-card px-3 py-2" />
        </Field>
        <Button type="submit" variant="outline" disabled={approving || returning}>Renvoyer la récompense</Button>
        {returned ? <p role="status" className="text-sm font-bold text-primary">{returned}</p> : null}
      </form>
    </div>
  );
}
