"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function reviewPrime(_current: string | null, formData: FormData): Promise<string | null> {
  const primeId = String(formData.get("primeId") ?? "");
  const reportId = String(formData.get("reportId") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const response = await writeJson(`/api/primes/${primeId}/reviews`, "POST", { result, reason: reason.trim() ? reason.trim() : null });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/primes");
  if (reportId) {
    revalidatePath(`/signalements/${reportId}`);
  }
  return result === "approved" ? "Prime approuvée. Aucun paiement n'est lancé." : "Prime renvoyée. Le motif est conservé.";
}
