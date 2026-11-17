"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export async function manageAccount(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  const id = String(data.get("id") ?? "");
  const operation = String(data.get("operation") ?? "");
  const permission = operation === "reset" ? "user.reset-password" : operation === "unlock" ? "user.unlock" : operation === "delete" ? "user.delete" : "";
  if (!permission || !can(account, permission)) return "Cette action n’est pas autorisée.";
  if (!/^[a-f\d-]{36}$/i.test(id)) return "Le compte est introuvable.";
  if (operation === "delete" && data.get("confirmation") !== "SUPPRIMER") return "Confirmez la suppression du compte.";
  const password = String(data.get("password") ?? "");
  if (operation === "reset" && (password.length < 12 || password.length > 72 || !/\p{L}/u.test(password) || !/\d/.test(password))) {
    return "Le mot de passe doit contenir de 12 à 72 caractères, une lettre et un chiffre.";
  }
  const path = operation === "reset" ? `/api/accounts/${id}/password` : operation === "unlock" ? `/api/accounts/${id}/unlock` : `/api/accounts/${id}`;
  const result = await writeJson(path, operation === "reset" ? "PUT" : operation === "delete" ? "DELETE" : "POST", operation === "reset" ? { password } : undefined);
  if (!result.ok) return result.message;
  revalidatePath("/comptes");
  return operation === "reset" ? "Mot de passe réinitialisé. Les sessions précédentes sont révoquées." : operation === "unlock" ? "Compte déverrouillé." : "Compte supprimé. L’historique des opérations est conservé.";
}
