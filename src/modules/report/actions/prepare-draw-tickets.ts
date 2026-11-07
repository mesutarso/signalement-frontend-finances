"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function prepareDrawTickets(_current: string | null, formData: FormData): Promise<string | null> {
  const month = String(formData.get("month") ?? "");
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return "Indiquez le mois.";
  }
  const result = await writeJson<{ created: number }>("/api/draw-tickets", "POST", { month: `${month}-01` });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/tirages");
  return result.body?.created ? null : "Les tickets de ce mois sont déjà retenus.";
}
