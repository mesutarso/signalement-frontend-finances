"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function keepTaxpayers(): Promise<string | null> {
  const result = await writeJson<{ created: number }>("/api/taxpayers", "POST");
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/contribuables");
  return result.body?.created ? null : "Aucun nouveau contribuable.";
}
