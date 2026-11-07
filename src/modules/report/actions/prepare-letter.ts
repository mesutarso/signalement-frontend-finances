"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

type Prepared = { id: string; created: boolean };

export async function prepareLetter(_current: string | null, _formData: FormData): Promise<string | null> {
  const response = await writeJson<Prepared>("/api/letters", "POST");
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/courriers");
  return response.body?.created
    ? "Courrier préparé. Il n'est pas envoyé."
    : "Le courrier de cette semaine est déjà préparé. Il n'est pas envoyé.";
}
