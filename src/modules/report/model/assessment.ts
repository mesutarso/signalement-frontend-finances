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
  readings: { photoId: string; readingId: string; status: string; model: string | null; errorCode: string | null; fields: Record<string, string> }[];
  updatedAt: string;
};

export type AssessmentView = {
  assessment: Assessment;
  reward: { id: string; amount: number; status: string; recordedAt: string } | null;
  fiscalApiAvailable: boolean;
};

export type RewardSetting = { id: string; amount: number; active: boolean; actorName: string | null; recordedAt: string };

export const VALIDATION_STATES: Record<string, string> = {
  queued: "Analyse en attente",
  analyzing: "Analyse en cours",
  doubt: "À vérifier",
  validated: "Validé",
  rejected: "Écarté",
};

export function validationLabel(state: string): string { return VALIDATION_STATES[state] ?? state; }
