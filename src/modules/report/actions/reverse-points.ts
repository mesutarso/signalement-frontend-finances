"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function reversePoints(_current: string | null, formData: FormData): Promise<string | null> {
  const reportId = String(formData.get("reportId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const response = await writeJson(`/api/reports/${reportId}/point-reversals`, "POST", { reason });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath(`/signalements/${reportId}`);
  revalidatePath("/points");
  revalidatePath("/primes");
  return "Points annulés par un mouvement inverse. Le crédit d'origine reste visible.";
}
