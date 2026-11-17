"use client";

import { useActionState } from "react";
import { manageAccount } from "@/modules/access/actions/manage-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export function AccountSecurityForm({ id, operation }: { id: string; operation: "reset" | "unlock" | "delete" }) {
  const [message, action, pending] = useActionState(manageAccount, null);
  return <form action={action}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="operation" value={operation} />
    <FieldGroup>
      {operation === "reset" ? <Field><FieldLabel htmlFor={`reset-${id}`}>Nouveau mot de passe</FieldLabel><Input id={`reset-${id}`} type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} required disabled={pending} /></Field> : null}
      {operation === "delete" ? <Field><FieldLabel htmlFor={`confirm-delete-${id}`}>Confirmer la suppression</FieldLabel><Input id={`confirm-delete-${id}`} name="confirmation" placeholder="Saisissez SUPPRIMER" pattern="SUPPRIMER" required disabled={pending} /></Field> : null}
      <Button type="submit" variant={operation === "delete" ? "destructive" : "outline"} disabled={pending}>{pending ? "Enregistrement…" : operation === "reset" ? "Réinitialiser le mot de passe" : operation === "unlock" ? "Déverrouiller le compte" : "Supprimer le compte"}</Button>
      {message ? <p role="status" className="text-sm">{message}</p> : null}
    </FieldGroup>
  </form>;
}
