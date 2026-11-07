export function ruleBody(formData: FormData): Record<string, unknown> | string {
  const numbers = ["fakeInvoice", "missingTransmission", "understated", "nonNormalized", "refusal", "bonus", "ceiling", "dailyCap", "spacingDays"] as const;
  const body: Record<string, unknown> = {};
  for (const name of numbers) {
    const value = Number(formData.get(name) ?? "");
    if (!Number.isInteger(value)) {
      return "Le barème n'est pas accepté.";
    }
    body[name] = value;
  }
  const tiers = String(formData.get("tiers") ?? "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [threshold, amount] = line.split(/\s+/).map(Number);
    return { threshold, amount };
  });
  if (tiers.some((tier) => !Number.isInteger(tier.threshold) || !Number.isInteger(tier.amount))) {
    return "Les paliers ne sont pas acceptés.";
  }
  body.tiers = tiers;
  const code = String(formData.get("code") ?? "").trim();
  if (code) {
    body.code = code;
  }
  return body;
}
