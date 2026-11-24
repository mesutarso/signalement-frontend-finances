"use server";

import { readOutcome, writeJson } from "@/lib/api";
import { readCurrentAccount } from "@/modules/access/queries/read-current-account";
import { exceptionPeriodQuery, type ExceptionCandidate, type ExceptionPayment, type ExceptionPeriod } from "@/modules/report/model/exception-regime";

const PATH = "/api/exception-regime";
const forbidden = { ok: false, status: 403, message: "Cette action est réservée à l’administration." } as const;
const unavailable = { ok: false, status: 503, message: "Le service est indisponible. Réessayez dans un instant." } as const;

export async function validateExceptionPeriod(period: ExceptionPeriod, reason: string) {
  if ((await readCurrentAccount())?.role !== "ADMINISTRATOR") return forbidden;
  return writeJson<{ validated: number; skipped: number }>(`${PATH}/validations`, "POST", { ...period, reason })
    .catch(() => unavailable);
}

export async function readExceptionCandidates(period: ExceptionPeriod) {
  if ((await readCurrentAccount())?.role !== "ADMINISTRATOR") return forbidden;
  return readOutcome<ExceptionCandidate[]>(`${PATH}/payment-candidates?${exceptionPeriodQuery(period)}`)
    .catch(() => unavailable);
}

export async function authorizeExceptionPayment(request: ExceptionPayment) {
  if ((await readCurrentAccount())?.role !== "ADMINISTRATOR") return forbidden;
  return writeJson<{ id: string; count: number; total: number }>(`${PATH}/payments`, "POST", request)
    .catch(() => unavailable);
}
