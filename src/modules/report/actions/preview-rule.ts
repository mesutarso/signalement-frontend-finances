"use server";

import { writeJson } from "@/lib/api";
import { ruleBody } from "@/modules/report/schema/rule-form";

type Tier = { threshold: number; amount: number };
type Preview = { base: number; bonus: number; ceiling: number; tiers: Tier[] };

export async function previewRule(_current: string | null, formData: FormData): Promise<string | null> {
  const body = ruleBody(formData);
  if (typeof body === "string") {
    return body;
  }
  const finding = String(formData.get("finding") ?? "").trim();
  const netPoints = Number(formData.get("netPoints") ?? "");
  if (!finding || !Number.isInteger(netPoints) || netPoints < 0) {
    return "L'exemple n'est pas accepté.";
  }
  const result = await writeJson<Preview>("/api/rules/previews", "POST", {
    ...body,
    finding,
    netPoints,
    firstEstablishment: formData.get("firstEstablishment") === "on",
  });
  if (!result.ok || !result.body) {
    return result.ok ? "L'exemple n'est pas accepté." : result.message;
  }
  const tiers = result.body.tiers.map((tier) => `${tier.threshold} points, ${tier.amount} FC`).join(" ; ");
  return `Exemple : ${result.body.base} points, bonus ${result.body.bonus}. Plafond ${result.body.ceiling} FC. Paliers atteints : ${tiers || "aucun"}.`;
}
