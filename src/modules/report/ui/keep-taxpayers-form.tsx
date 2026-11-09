"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { keepTaxpayers } from "@/modules/report/actions/keep-taxpayers";

export function KeepTaxpayersForm() {
  const [message, action, pending] = useActionState(keepTaxpayers, null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-3">
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>Retenir les numéros</Button>
    </form>
  );
}
