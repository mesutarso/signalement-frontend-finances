"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function reviewPaymentSample(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  const sampleId = String(formData.get("sampleId") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["conform", "anomaly"].includes(result)) {
    return "Le résultat du contrôle n'est pas accepté.";
  }
  if (result === "anomaly" && !reason) {
    return "Indiquez le motif de l'anomalie.";
  }
  const response = await writeJson(`/api/payment-samples/lines/${id}/reviews`, "POST", { result, reason: result === "anomaly" ? reason : null });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/echantillons");
  revalidatePath(`/echantillons/${sampleId}`);
  return null;
}
