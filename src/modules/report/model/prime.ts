export type PrimeReview = {
  id: string;
  result: string;
  reason: string | null;
  actorName: string | null;
  recordedAt: string;
};

export type PrimeTier = {
  id: string;
  threshold: number;
  amount: number;
  status: string;
  phone: string | null;
  recordedAt: string;
  reviews: PrimeReview[];
};

export type PrimeAccount = {
  netPoints: number;
  surplus: number;
  grantedAmount: number;
  ceiling: number;
  phoneState: string;
  phone: string | null;
  tiers: PrimeTier[];
};

export function francs(amount: number): string {
  const digits = String(Math.abs(amount));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} FC`;
}

export function payoutStateLabel(state: string): string {
  if (state === "ready") {
    return "Un seul numéro";
  }
  if (state === "missing") {
    return "Numéro manquant";
  }
  if (state === "several") {
    return "Plusieurs numéros";
  }
  return "Aucun numéro";
}

export function primeStatusLabel(status: string): string {
  if (status === "proposed") {
    return "Proposée";
  }
  if (status === "approved") {
    return "Approuvée";
  }
  if (status === "returned") {
    return "Renvoyée";
  }
  if (status === "withdrawn") {
    return "Retirée";
  }
  return status;
}

export function primeStatusVariant(status: string): "warning" | "success" | "destructive" | "outline" {
  if (status === "proposed") {
    return "warning";
  }
  if (status === "approved") {
    return "success";
  }
  return status === "returned" ? "destructive" : "outline";
}
