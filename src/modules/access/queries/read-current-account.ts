import { readOptionalJson } from "@/lib/api";
import { toAccount, type Account } from "@/modules/access/model/account";

export async function readCurrentAccount(): Promise<Account | null> {
  const payload = await readOptionalJson<Account>("/api/auth");
  return payload ? toAccount(payload) : null;
}
