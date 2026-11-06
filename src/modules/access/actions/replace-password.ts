"use server";

import { writeJson } from "@/lib/api";
import { readPassword } from "@/modules/access/schema/credentials";

export type PasswordState = { error: string | null; saved: boolean };

export async function replacePassword(_current: PasswordState, formData: FormData): Promise<PasswordState> {
  const accountId = String(formData.get("accountId") ?? "");
  const input = readPassword(formData);
  if (typeof input === "string") {
    return { error: input, saved: false };
  }
  const result = await writeJson(`/api/accounts/${accountId}/password`, "PUT", input);
  if (!result.ok) {
    return { error: result.message, saved: false };
  }
  return { error: null, saved: true };
}
