"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { preparePaymentStatement } from "@/modules/report/actions/prepare-payment-statement";

export function PreparePaymentForm() {
  const [message, action, pending] = useActionState(preparePaymentStatement, null);
  return (
    <form action={action} className="grid gap-3">
      <Button type="submit" disabled={pending}>Préparer l&apos;état</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
