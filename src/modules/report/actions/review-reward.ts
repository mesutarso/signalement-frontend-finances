"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function reviewReward(_current: string | null, formData: FormData): Promise<string | null> {
  const rewardId = String(formData.get("rewardId") ?? "");
  const reportId = String(formData.get("reportId") ?? "");
  const result = String(formData.get("result") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const response = await writeJson(`/api/rewards/${rewardId}/reviews`, "POST", { result, reason: reason.trim() ? reason.trim() : null });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/recompenses");
  if (reportId) {
    revalidatePath(`/signalements/${reportId}`);
  }
  return result === "approved" ? "Récompense approuvée." : "Récompense renvoyée.";
}
