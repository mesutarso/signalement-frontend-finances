"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function updateAccount(_current: string | null, formData: FormData): Promise<string | null> {
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const enabled = String(formData.get("enabled") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["AGENT", "SUPERVISOR", "AUDITOR", "ADMINISTRATOR", "CELLULE", "CABINET", "PAYMASTER"].includes(role) || !["true", "false"].includes(enabled)) {
    return "Vérifiez le rôle et l’état du compte.";
  }
  const result = await writeJson(`/api/accounts/${id}`, "PATCH", { role, enabled: enabled === "true" });
  if (!result.ok) return result.message;
  revalidatePath("/comptes");
  return null;
}
