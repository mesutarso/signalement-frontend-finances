import type { TransferEnvironment, TransferOperator } from "@/modules/report/model/transfer";

export type ExceptionPeriod = { start?: string; end?: string };

export type ExceptionReport = {
  id: string;
  reference: string;
  date: string;
  declarant: string | null;
  company: string | null;
  state: string;
  finding: string | null;
  reason: string | null;
  amount: number | null;
  paymentState: string;
  paymentReference: string | null;
  paymentError: string | null;
};

export type ExceptionPage = {
  items: ExceptionReport[];
  total: number;
  validatable: number;
  page: number;
  size: number;
  environment: TransferEnvironment;
  configured: boolean;
};

export type ExceptionCandidate = {
  id: string;
  reference: string;
  phone: string;
  amount: number;
  lineId: string | null;
  previousTransferId: string | null;
};

export type ExceptionOrder = Omit<ExceptionCandidate, "reference"> & { operator: TransferOperator };
export type ExceptionPayment = {
  requestId: string;
  environment: TransferEnvironment;
  reason: string;
  orders: ExceptionOrder[];
};

export function exceptionDate(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

export function exceptionPeriodQuery({ start, end }: ExceptionPeriod) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  return params;
}
