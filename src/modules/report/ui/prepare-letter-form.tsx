"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { prepareLetter } from "@/modules/report/actions/prepare-letter";

export function PrepareLetterForm() {
  const [message, action, pending] = useActionState(prepareLetter, null);
  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-3">
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>Préparer les courriers par service</Button>
    </form>
  );
}
