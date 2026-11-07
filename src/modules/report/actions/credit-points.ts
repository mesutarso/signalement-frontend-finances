"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function creditPoints(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const response = await writeJson(`/api/reports/${reportId}/points`, "POST", { reference });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath("/points");
  revalidatePath("/primes");
  return "Points crédités. Aucune prime n'est déclenchée.";
}
