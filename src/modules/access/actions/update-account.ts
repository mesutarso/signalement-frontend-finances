"use server";

import { ACCOUNT_ROLES, can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function updateAccount(_current: string | null, formData: FormData): Promise<string | null> {
  if (!can(await readCurrentAccount(), "user.update")) return "Cette action n’est pas autorisée.";
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/.test(username)) return "Vérifiez l’identifiant du compte.";
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const enabled = String(formData.get("enabled") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ACCOUNT_ROLES.some(value => value === role) || !["true", "false"].includes(enabled)) {
    return "Vérifiez le rôle et l’état du compte.";
  }
  const result = await writeJson(`/api/accounts/${id}`, "PATCH", { username, role, enabled: enabled === "true" });
  if (!result.ok) return result.message;
  revalidatePath("/comptes");
  return null;
}
