"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function preparePaymentSample(_current: string | null, formData: FormData): Promise<string | null> {
  const periodStart = String(formData.get("periodStart") ?? "");
  const periodEnd = String(formData.get("periodEnd") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart) || !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)) {
    return "Indiquez une période valide.";
  }
  const result = await writeJson("/api/payment-samples", "POST", { periodStart, periodEnd });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/echantillons");
  return null;
}
