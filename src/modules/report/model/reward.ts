export type RewardReview = {
  id: string;
  result: string;
  reason: string | null;
  actorName: string | null;
  recordedAt: string;
};

export type Reward = {
  id: string;
  reportId: string;
  amount: number;
  status: string;
  phone: string | null;
  recordedAt: string;
  reviews: RewardReview[];
  payment: RewardPayment | null;
};

export type RewardPayment = {
  lineId: string | null;
  statementId: string | null;
  statementReference: string | null;
  state: string;
  transferId: string | null;
  transferReference: string | null;
};

export function rewardPaymentStatus(reward: Reward): {
  label: string;
  variant: "success" | "warning" | "destructive" | "secondary" | "outline";
} {
  switch (reward.payment?.state) {
    case "paid": return { label: "Payée", variant: "success" };
    case "test-paid": return { label: "Test réussi", variant: "secondary" };
    case "submitting":
    case "pending": return { label: "En cours", variant: "secondary" };
    case "unknown": return { label: "À confirmer", variant: "warning" };
    case "failed": return { label: "Échec", variant: "destructive" };
    case "ready": return { label: "À payer", variant: "secondary" };
    case "blocked": return { label: "À vérifier", variant: "warning" };
    case "exceptional": return { label: "Régime d’exception", variant: "secondary" };
    case "another-payer": return { label: "Autre gestionnaire requis", variant: "warning" };
    default: return reward.status === "approved"
      ? { label: "En attente d’autorisation", variant: "outline" }
      : { label: "—", variant: "outline" };
  }
}

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

export function rewardStatusLabel(status: string): string {
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

export function rewardStatusVariant(status: string): "warning" | "success" | "destructive" | "outline" {
  if (status === "proposed") {
    return "warning";
  }
  if (status === "approved") {
    return "success";
  }
  return status === "returned" ? "destructive" : "outline";
}
