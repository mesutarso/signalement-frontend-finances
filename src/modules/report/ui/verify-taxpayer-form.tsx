"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { verifyTaxpayer } from "@/modules/report/actions/verify-taxpayer";

export function VerifyTaxpayerForm({ id }: { id: string }) {
  const [message, action, pending] = useActionState(verifyTaxpayer, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" disabled={pending}>Vérifier le numéro</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
