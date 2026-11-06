import { readJson } from "@/lib/api";
import { toAccountPage, type AccountPage } from "@/modules/access/model/account";

export async function readAccounts(page = 0, filters: { search?: string; role?: string; enabled?: string } = {}): Promise<AccountPage> {
  const params = new URLSearchParams({ page: String(page), size: "20" });
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.enabled) params.set("enabled", filters.enabled);
  const payload = await readJson<AccountPage>(`/api/accounts?${params}`);
  return toAccountPage(payload);
}
