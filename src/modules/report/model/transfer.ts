export type PaymentTransfer = {
  id: string;
  lineId: string | null;
  environment: "sandbox" | "production";
  reference: string;
  provider: string;
  wallet: string;
  amount: number;
  state: string;
  code: string;
  transactionId: string | null;
  startedAt: string;
  updatedAt: string;
};

export type PaymentService = { environment: "sandbox" | "production"; configured: boolean; transfers: PaymentTransfer[] };

export function transferLabel(transfer: PaymentTransfer): string {
  if (transfer.state === "paid") return transfer.environment === "sandbox" ? "Test réussi" : "Payé";
  if (transfer.state === "failed") return "Échec";
  if (transfer.state === "unknown") return "À confirmer";
  return "En cours";
}

export function isSandboxWallet(phone: string): boolean {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^0[0-9]{9}$/.test(digits)) digits = "243" + digits.slice(1);
  return /^243(81|84|97|90)000000[1-4]$/.test(digits);
}
