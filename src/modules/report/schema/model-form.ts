import { SMS_LIMIT, storedPattern } from "@/modules/report/model/message";

const KINDS = ["payout", "reexamination", "situation"];

export function modelBody(formData: FormData): { kind: string; body: string } | string {
  const kind = String(formData.get("kind") ?? "").trim();
  const body = storedPattern(String(formData.get("body") ?? "").trim());
  const markers = body.split("%s").length - 1;
  if (!KINDS.includes(kind) || body.length === 0 || markers !== 1 || /[\u0000-\u001f\u007f-\u009f]/u.test(body)) {
    return "Insérez la référence une seule fois, sur une seule ligne.";
  }
  if (body.length - 2 + 36 > SMS_LIMIT) return "Le SMS dépasse 100 caractères, référence comprise. Raccourcissez le texte.";
  return { kind, body };
}
