"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { keepTaxpayers } from "@/modules/report/actions/keep-taxpayers";

export function KeepTaxpayersForm() {
  const [message, action, pending] = useActionState(keepTaxpayers, null);
  return (
    <form action={action} className="grid gap-3">
      <Button type="submit" disabled={pending}>Retenir les numéros</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
