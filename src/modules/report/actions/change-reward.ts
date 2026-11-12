"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";

export async function changeReward(_current: string | null, data: FormData): Promise<string | null> {
  const account = await readCurrentAccount();
  if (!account || !["SUPERVISOR", "ADMINISTRATOR"].includes(account.role)) return "Cette action n’est pas autorisée.";
  const amount = Number(data.get("amount"));
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 2147483647) return "Indiquez un montant entier positif en FC.";
  const result = await writeJson("/api/reward-settings", "POST", { amount, expectedId: String(data.get("expectedId") ?? "") });
  if (!result.ok) return result.message;
  revalidatePath("/regles");
  return "Montant enregistré pour les prochaines validations.";
}
