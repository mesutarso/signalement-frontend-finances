"use server";

import { can } from "@/modules/access/model/account";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";
import { readAccount } from "@/modules/access/schema/credentials";

export async function createAccount(_current: string | null, formData: FormData): Promise<string | null> {
  if (!can(await readCurrentAccount(), "user.create")) return "Cette action n’est pas autorisée.";
  const input = readAccount(formData);
  if (typeof input === "string") {
    return input;
  }
  const result = await writeJson("/api/accounts", "POST", input);
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/comptes");
  return null;
}
