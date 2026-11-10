"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function verifyBeneficiary(_current: string | null, data: FormData): Promise<string | null> {
  const result = await writeJson("/api/beneficiaries", "POST", {
    reference: String(data.get("reference") ?? ""),
    beneficiaryReference: String(data.get("beneficiaryReference") ?? ""),
    evidence: String(data.get("evidence") ?? ""),
  });
  if (!result.ok) return result.message;
  revalidatePath("/declarants");
  revalidatePath("/primes");
  return "Identité vérifiée. Le plafond est partagé entre les comptes rattachés au même dossier.";
}
