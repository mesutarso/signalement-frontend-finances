"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changeReward } from "@/modules/report/actions/change-reward";
import type { RewardSetting } from "@/modules/report/model/assessment";

export function RewardSettingForm({ setting }: { setting: RewardSetting }) {
  const [message, action, pending] = useActionState(changeReward, null);
  return <form action={action} className="max-w-sm"><FieldGroup>
    <input type="hidden" name="expectedId" value={setting.id} />
    <Field><FieldLabel htmlFor="reward-amount">Récompense par signalement validé (FC)</FieldLabel>
      <Input id="reward-amount" name="amount" type="number" min={1} max={2147483647} step={1} required defaultValue={setting.amount} />
    </Field>
    <Button disabled={pending} type="submit">{pending ? "Enregistrement…" : "Enregistrer le montant"}</Button>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </FieldGroup></form>;
}
