export const TRANSFER_OPERATORS = [["mpesa", "M-Pesa", "81"], ["orange", "Orange Money", "84"], ["airtel", "Airtel Money", "97"], ["afrimoney", "Afrimoney", "90"]] as const;

export type TransferOperator = (typeof TRANSFER_OPERATORS)[number][0];
export type TransferEnvironment = "sandbox" | "production";

export type PaymentTransfer = {
  id: string;
  lineId: string | null;
  environment: TransferEnvironment;
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

export type PaymentService = { environment: TransferEnvironment; configured: boolean; transfers: PaymentTransfer[] };

export function transferLabel(transfer: PaymentTransfer): string {
  if (transfer.state === "paid") return transfer.environment === "sandbox" ? "Test réussi" : "Payé";
  if (transfer.state === "failed") return "Échec";
  if (transfer.state === "unknown") return "À confirmer";
  return "En cours";
}

export function isSandboxWallet(phone: string): boolean {
  return sandboxTransferOperator(phone) !== undefined;
}

export function sandboxTransferOperator(phone: string): TransferOperator | undefined {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^0[0-9]{9}$/.test(digits)) digits = "243" + digits.slice(1);
  return TRANSFER_OPERATORS.find(([, , prefix]) =>
    digits.length === 12 && digits.startsWith(`243${prefix}000000`) && /^[1-4]$/.test(digits.at(-1) ?? "")
  )?.[0];
}
