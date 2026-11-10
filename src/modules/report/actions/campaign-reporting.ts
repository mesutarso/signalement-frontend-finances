"use server";
import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function recordBudget(_current: string | null, data: FormData): Promise<string | null> {
  const response = await writeJson("/api/campaign-budget", "POST", { amount: Number(data.get("amount")), reference: String(data.get("reference") ?? "") });
  if (!response.ok) return response.message;
  revalidatePath("/regles");
  revalidatePath("/indicateurs");
  return "Budget prévisionnel enregistré et historisé.";
}

export async function captureReport(_current: string | null, data: FormData): Promise<string | null> {
  const response = await writeJson("/api/campaign-reports", "POST", { kind: String(data.get("kind") ?? "") });
  if (!response.ok) return response.message;
  revalidatePath("/indicateurs");
  return "Rapport de la dernière période close enregistré. Une nouvelle demande ne crée pas de doublon.";
}
