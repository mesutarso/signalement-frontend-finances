"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordPaymentAttempt(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  const lineId = String(formData.get("lineId") ?? "");
  const operator = String(formData.get("operator") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(lineId) || !["paid", "failed", "unknown"].includes(result)) {
    return "Le résultat n'est pas accepté.";
  }
  if (!["airtel", "m-pesa", "orange", "afrimoney"].includes(operator)) {
    return "Choisissez un moyen de paiement.";
  }
  const response = await writeJson(`/api/payment-statements/${id}/attempts`, "POST", {
    lineId,
    operator,
    result,
    reason: reason || null,
  });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/etats");
  revalidatePath(`/etats/${id}`);
  return null;
}
