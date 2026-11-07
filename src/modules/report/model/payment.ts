export type PaymentAttempt = {
  id: string;
  result: string;
  reference: string | null;
  reason: string | null;
  recordedAt: string;
  operator: string;
};

export type PaymentLine = {
  id: string;
  primeId: string;
  threshold: number;
  amount: number;
  phone: string;
  attempts: PaymentAttempt[];
};

export type PaymentExclusion = {
  primeId: string;
  reason: string;
};

export type PaymentStatement = {
  id: string;
  reference: string;
  status: string;
  total: number;
  preparedAt: string;
  controlledAt: string | null;
  visaedAt: string | null;
  authorizedAt: string | null;
  dueOn: string | null;
  reason: string | null;
  lines: PaymentLine[];
  exclusions: PaymentExclusion[];
};

export type PaymentItem = {
  id: string;
  reference: string;
  status: string;
  total: number;
  preparedAt: string;
  dueOn: string | null;
};

export function paymentStatusLabel(status: string): string {
  if (status === "draft") return "Brouillon";
  if (status === "controlled") return "Contrôlé";
  if (status === "visaed") return "Visé";
  if (status === "authorized") return "Autorisé";
  if (status === "returned") return "Renvoyé";
  if (status === "refused") return "Refusé";
  return status;
}

export function paymentOperatorLabel(operator: string): string {
  if (operator === "airtel") return "Airtel Money";
  if (operator === "m-pesa") return "M-Pesa";
  if (operator === "orange") return "Orange Money";
  if (operator === "afrimoney") return "Afrimoney";
  return operator;
}

export function paymentAttemptLabel(result: string): string {
  if (result === "paid") return "Payée";
  if (result === "failed") return "Échec";
  if (result === "unknown") return "Résultat à confirmer";
  return result;
}
