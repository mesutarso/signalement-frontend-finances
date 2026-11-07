"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordAbuseNote(_current: string | null, formData: FormData): Promise<string | null> {
  const fingerprint = String(formData.get("fingerprint") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const result = await writeJson(`/api/abuse-indices/${fingerprint}/notes`, "POST", { decision, reason });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/indices");
  return decision === "noted"
    ? "Indice noté. Ce n'est pas une preuve de fraude."
    : "Indice écarté. Le droit aux primes n'est pas modifié.";
}
