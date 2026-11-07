import { readJson } from "@/lib/api";
import type { SellerFilePage } from "@/modules/report/model/report";

export async function readSellerFiles(status: string, page: number): Promise<SellerFilePage> {
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("page", String(page));
  return readJson<SellerFilePage>(`/api/seller-files?${params}`);
}
