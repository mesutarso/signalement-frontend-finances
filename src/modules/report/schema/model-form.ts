const KINDS = ["photo", "payout", "reexamination", "situation"];

export function modelBody(formData: FormData): { kind: string; body: string } | string {
  const kind = String(formData.get("kind") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const markers = body.split("%s").length - 1;
  if (!KINDS.includes(kind) || body.length === 0 || body.length > 500 || markers !== 1) {
    return "Le modèle contient la référence %s une seule fois.";
  }
  return { kind, body };
}
