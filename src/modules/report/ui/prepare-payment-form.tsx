"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { preparePaymentStatement } from "@/modules/report/actions/prepare-payment-statement";

export function PreparePaymentForm() {
  const [message, action, pending] = useActionState(preparePaymentStatement, null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-3">
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>Préparer l&apos;état</Button>
    </form>
  );
}
