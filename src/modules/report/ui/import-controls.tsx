"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { importReports, retryImport } from "@/modules/report/actions/import-reports";

export function ImportControls({ today, busy }: { today: string; busy: boolean }) {
  const router = useRouter();
  const [message, submit, pending] = useActionState(async (current: string | null, data: FormData) => {
    const result = await importReports(current, data);
    router.refresh();
    return result;
  }, null);
  return <form action={submit} className="flex flex-col gap-4"><FieldGroup className="grid items-end gap-4 sm:grid-cols-3"><Field><FieldLabel htmlFor="import-start">Du</FieldLabel><Input id="import-start" name="start" type="date" defaultValue={today.slice(0, 4) + "-01-01"} required disabled={busy || pending} /></Field><Field><FieldLabel htmlFor="import-end">Au</FieldLabel><Input id="import-end" name="end" type="date" defaultValue={today} required disabled={busy || pending} /></Field><Button type="submit" disabled={busy || pending}>{pending ? <Spinner data-icon="inline-start" /> : null}{busy ? "Import en cours" : "Lancer l’import"}</Button></FieldGroup>{message ? <p role="status" className="text-sm">{message}</p> : null}</form>;
}

export function RetryImportButton({ id, disabled }: { id: string; disabled: boolean }) {
  const router = useRouter();
  const [message, submit, pending] = useActionState(async () => {
    const result = await retryImport(id);
    router.refresh();
    return result;
  }, null);
  return <form action={submit} className="grid gap-2"><Button variant="outline" size="sm" disabled={disabled || pending} type="submit">{pending ? <Spinner data-icon="inline-start" /> : null}Relancer</Button>{message ? <span role="status" className="max-w-48 whitespace-normal text-xs">{message}</span> : null}</form>;
}
