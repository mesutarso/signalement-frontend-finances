"use server";

import { revalidatePath } from "next/cache";
import { writeJson } from "@/lib/api";

export async function organizeDraw(_current: string | null, formData: FormData): Promise<string | null> {
  const kind = String(formData.get("kind") ?? "");
  const month = String(formData.get("month") ?? "");
  const witness = String(formData.get("witness") ?? "").trim();
  const quantity = (name: string) => {
    const value = Number(formData.get(name) ?? 0);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  };
  if (!["monthly", "final"].includes(kind) || !witness) {
    return "Indiquez le témoin.";
  }
  if (kind === "monthly" && !/^\d{4}-\d{2}$/.test(month)) {
    return "Indiquez le mois.";
  }
  const result = await writeJson("/api/draws", "POST", {
    kind,
    month: kind === "monthly" ? `${month}-01` : "2027-04-01",
    witness,
    campaign: quantity("campaign"),
    intermediate: quantity("intermediate"),
    motorcycles: quantity("motorcycles"),
    cars: quantity("cars"),
  });
  if (!result.ok) {
    return result.message;
  }
  revalidatePath("/tirages");
  return null;
}
