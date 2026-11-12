"use server";

import { revalidatePath } from "next/cache";
import { writeForm } from "@/lib/api";

export async function recordLetterResponse(_current: string | null, formData: FormData): Promise<string | null> {
  const letterId = String(formData.get("letterId") ?? "");
  const response = await writeForm(`/api/letters/${letterId}/responses`, formData);
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/courriers");
  revalidatePath(`/courriers/${letterId}`);
  return "Réponse enregistrée.";
}
