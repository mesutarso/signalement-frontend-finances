"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function prepareLetter(): Promise<string | null> {
  const response = await writeJson<string[]>("/api/letters/weekly", "POST");
  if (!response.ok) {
    return response.message;
  }
  revalidatePath("/courriers");
  return `${response.body?.length ?? 0} courrier(s) de la semaine préparé(s) par service, sans nouvel envoi.`;
}
