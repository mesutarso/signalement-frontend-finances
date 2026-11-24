export type ListPage<T> = { items: T[]; page: number; size: number; total: number };

export type DeclarantOverview = {
  reportId: string;
  reference: string;
  name: string | null;
  identified: boolean;
  total: number;
  validated: number;
  validatedRewardAmount: number;
  rejected: number;
  duplicates: number;
  pending: number;
};

export type CompanyOverview = {
  taxId: string | null;
  name: string | null;
  total: number;
  validated: number;
  rejected: number;
  duplicates: number;
  pending: number;
  registryVerified: boolean | null;
};

export const DOSSIER_PAYMENT_STATUSES = {
  preparing: "En préparation",
  "to-pay": "À payer",
  pending: "En cours",
  paid: "Payé",
  failed: "Échec",
  unknown: "À confirmer",
} as const;

export type DossierPaymentStatus = keyof typeof DOSSIER_PAYMENT_STATUSES;
export type DossierPayment = {
  reportId: string;
  reference: string;
  amount: number;
  status: DossierPaymentStatus;
  statementId: string | null;
};

export type ReportAnalysisOverview = {
  enabled: boolean;
  queued: number;
  running: number;
  completed: number;
  failed: number;
};

export type Correction = { id: string; reason: string; recordedAt: string };
export type Reexamination = {
  id: string;
  reference: string;
  requestText: string;
  receivedOn: string;
  onTime: boolean;
  status: string;
  comment: string | null;
};

export function pageIndex(value: string | string[] | undefined) {
  const page = Number(typeof value === "string" ? value : 0);
  return Number.isSafeInteger(page) && page >= 0 && page <= 2147483647 ? page : 0;
}
