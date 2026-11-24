export type Assessment = {
  reportId: string;
  revision: number;
  state: string;
  jobState: string;
  reason: string;
  photoId: string | null;
  sellerName: string | null;
  sellerTaxId: string | null;
  documentNumber: string | null;
  documentDate: string | null;
  vatStatus: string;
  vatEvidence: string | null;
  vatSource: string | null;
  checkedBy: string | null;
  checkedAt: string | null;
  normalization: string;
  normalizationEvidence: string | null;
  purchaseConformity: string;
  purchaseEvidence: string | null;
  vatCharged: string;
  vatChargeEvidence: string | null;
  uniqueness: string;
  uniquenessEvidence: string | null;
  extracted: Record<string, string>;
  readings: { photoId: string; readingId: string; status: string; quality: string | null; model: string | null; errorCode: string | null; fields: Record<string, string> }[];
  updatedAt: string;
};

export type AssessmentView = {
  assessment: Assessment;
  finding: string | null;
  reward: { id: string; amount: number; status: string; recordedAt: string } | null;
  fiscalApiAvailable: boolean;
  precalculation: AssessmentPrecalculation | null;
};

export function requiresFiscalReview(view: AssessmentView): boolean {
  return view.precalculation?.fiscalReviewRequired ?? (view.assessment.vatCharged !== "yes");
}

export type AssessmentDecision = { state: string; finding: string | null; reason: string };

export type AssessmentPrecalculation = {
  ruleVersion: string;
  analysisComplete: boolean;
  fiscalReviewRequired: boolean;
  fiscalStatusMissing: boolean;
  onlyFiscalStatusMissing: boolean;
  missingFields: string[];
  criteria: { key: string; label: string; value: string; source: string; detail: string | null }[];
  ifRegistered: AssessmentDecision;
  ifUnregistered: AssessmentDecision;
};

export type RewardSetting = { id: string; amount: number; active: boolean; actorName: string | null; recordedAt: string };

export const VALIDATION_FINDINGS = {
  "fake-normalization": "Facture faussement normalisée",
  "vat-without-normalization": "TVA collectée sans facture normalisée",
  "registered-non-normalized": "Entreprise assujettie ne délivrant pas de facture normalisée",
  "non-normalized": "Facture non normalisée",
} as const;

export const REJECTION_REASONS = {
  normalized: "Facture déjà normalisée",
  unregistered: "Entreprise non assujettie à la TVA (non éligible)",
  unreadable: "Facture illisible",
  duplicate: "Facture déjà signalée",
} as const;

export const UNREADABLE_MESSAGE = "Veuillez refaire votre signalement avec une photo plus lisible.";

export const VALIDATION_STATES: Record<string, string> = {
  queued: "Non traité",
  analyzing: "Non traité",
  doubt: "À vérifier",
  validated: "Validé",
  rejected: "Rejeté",
  legacy: "Historique",
};

export function validationLabel(state: string): string { return VALIDATION_STATES[state] ?? state; }

export const REPORT_STATUS_FILTERS = [
  ["all", "Tous les statuts"],
  ["untreated", VALIDATION_STATES.queued],
  ["doubt", VALIDATION_STATES.doubt],
  ["validated", VALIDATION_STATES.validated],
  ["rejected", VALIDATION_STATES.rejected],
] as const;

export function normalizeReportStatusFilter(value: string): string {
  switch (value) {
    case "queued":
    case "analyzing":
      return "untreated";
    case "completion":
      return "doubt";
    case "rejected-duplicate":
    case "rejected-unreadable":
    case "rejected-identity-missing":
      return "rejected";
    default:
      return value;
  }
}

export const SCREENING_REASONS: Record<string, string> = {
  unreadable: "Photo illisible",
  "identity-missing": "NIF non récupéré",
  duplicate: "Doublon",
};
