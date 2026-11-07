"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { prepareLetter } from "@/modules/report/actions/prepare-letter";

export function PrepareLetterForm() {
  const [message, action, pending] = useActionState(prepareLetter, null);
  return (
    <form action={action} className="grid gap-3">
      <Button type="submit" disabled={pending}>Préparer le courrier de la semaine</Button>
      {message ? <p role="status" className="text-sm font-bold text-primary">{message}</p> : null}
    </form>
  );
}
