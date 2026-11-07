"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function decideLetter(_current: string | null, formData: FormData): Promise<string | null> {
  const letterId = String(formData.get("letterId") ?? "");
  const result = String(formData.get("result") ?? "");
  const recipient = String(formData.get("recipient") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const response = await writeJson(`/api/letters/${letterId}/decisions`, "POST", { result, recipient, reason });
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/courriers");
  revalidatePath(`/courriers/${letterId}`);
  return result === "validated"
    ? "Courrier validé. Il n'est pas envoyé."
    : "Courrier renvoyé. Les annexes déjà préparées restent en place.";
}
