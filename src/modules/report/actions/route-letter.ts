"use server";
import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function routeLetter(_current: string | null, data: FormData): Promise<string | null> {
  const result = await writeJson("/api/letter-routes", "POST", { taxId: String(data.get("taxId") ?? ""), service: String(data.get("service") ?? "") });
  if (!result.ok) return result.message;
  revalidatePath("/courriers");
  return "Service destinataire enregistré pour les prochains courriers.";
}

export async function dispatchLetter(_current: string | null, data: FormData): Promise<string | null> {
  const id = String(data.get("letterId") ?? "");
  const result = await writeJson(`/api/letters/${id}/dispatches`, "POST", { sentOn: String(data.get("sentOn") ?? ""), reference: String(data.get("reference") ?? "") });
  if (!result.ok) return result.message;
  revalidatePath(`/courriers/${id}`);
  return "Envoi enregistré.";
}
