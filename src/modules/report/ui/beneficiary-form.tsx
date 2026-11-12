"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verifyBeneficiary } from "@/modules/report/actions/verify-beneficiary";

export function BeneficiaryForm({ reference }: { reference: string }) {
  const [message, action, pending] = useActionState(verifyBeneficiary, null);
  return (
    <form action={action}>
      <input type="hidden" name="reference" value={reference} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="beneficiary-reference">Dossier du bénéficiaire vérifié</FieldLabel>
          <Input id="beneficiary-reference" name="beneficiaryReference" minLength={3} maxLength={80} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="beneficiary-evidence">Référence du justificatif contrôlé</FieldLabel>
          <Input id="beneficiary-evidence" name="evidence" maxLength={160} required />
        </Field>
        <Button type="submit" disabled={pending}>Rattacher définitivement le compte</Button>
        {message ? <p role="status" className="text-sm">{message}</p> : null}
      </FieldGroup>
    </form>
  );
}
