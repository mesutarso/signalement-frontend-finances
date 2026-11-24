import { VALIDATION_FINDINGS } from "@/modules/report/model/assessment";
export type ReportSummary = {
  id: string;
  identifier: string;
  reportedAt: string;
  title: string | null;
  state: string;
  validationState: string;
  screeningReason: string | null;
  work?: { sellerName: string | null; sellerTaxId: string | null; documentNumber: string | null;
    documentDate: string | null; totalAmount: string | null; currency: string | null;
    vatStatus: string; jobState: string; reason: string; photoRequested: boolean } | null;
  priority: string | null;
  assigneeName: string | null;
  version: number;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
};

export type ReportPage = {
  reports: ReportSummary[];
  page: number;
  size: number;
  total: number;
};

export function reportReferenceLabel(reference: string | null): string | null {
  const text = reference?.trim();
  return text && !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(text) ? text : null;
}

export function reportTitle(title: string | null): string {
  return reportReferenceLabel(title) ?? "Signalement sans titre";
}

export function formatDeclarantName(name: string | null): string | null {
  // FACNO can concatenate name parts at a change of case.
  // Requiring three lowercase letters preserves short mixed-case prefixes such as MacDonald.
  return name?.trim().replace(/(\p{Lu}{2,}|\p{Ll}{3,})(?=\p{Lu}\p{Ll})/gu, "$1 ") || null;
}

export type ReportPhoto = {
  id: string;
  contentType: string;
  reading: PhotoReading | null;
};

export type PhotoArticle = {
  designation: string | null;
  amount: string | null;
};

export type PhotoReading = {
  status: string;
  quality: string | null;
  confidence: number | null;
  sellerName: string | null;
  sellerTaxId: string | null;
  documentDate: string | null;
  amount: string | null;
  documentNumber: string | null;
  code: string | null;
  currency: string | null;
  netAmount: string | null;
  vatAmount: string | null;
  vatRate: string | null;
  paidAmount: string | null;
  defCode: string | null;
  defNumber: string | null;
  model: string | null;
  schemaVersion: string | null;
  articles: PhotoArticle[];
  errorCode: string | null;
};

export function readingErrorLabel(_code: string | null): string {
  void _code;
  return "La facture n’a pas pu être lue. Consultez la photo pour compléter les informations.";
}

export type PhotoRequest = {
  id: string;
  photoId: string;
  referenceCode: string;
  reason: string;
  basis: string;
  status: string;
  actorName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  linkedIdentifier: string | null;
  notice: string;
  messageId: string | null; messageStatus: string | null; messageBody: string | null;
};

export type ReportDetail = ReportSummary & {
  referenceCode?: string;
  historicalDecision?: string | null;
  assigneeId: string | null;
  description: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  reporterUserId: string | null;
  photos: ReportPhoto[];
  photoRequests: PhotoRequest[];
  duplicates: DuplicateAlert[];
  reviews: SupervisionReview[];
};

export type SupervisionReview = {
  id: string;
  qualificationId: string;
  result: string;
  reason: string;
  actorName: string | null;
  recordedAt: string;
};

export type DuplicateAlert = {
  id: string;
  otherReportId: string;
  otherIdentifier: string | null;
  otherReportedAt: string | null;
  criterion: string;
  strength: string;
  explanation: string;
  status: string;
  reason: string | null;
  actorName: string | null;
  decidedAt: string | null;
  priorityReportId: string | null;
  priorityIdentifier: string | null;
  priorityReportedAt: string | null;
  priorityBasis: string | null;
  currentKeepsPriority: boolean;
  currentReporterName: string | null; currentReporterPhone: string | null;
  otherReporterName: string | null; otherReporterPhone: string | null;
  differentDeclarants: boolean | null;
};

export type Assignee = {
  id: string;
  username: string;
};

export type ImportResult = {
  id: string;
  status: string;
  createdReports: number;
  skippedReports: number;
  createdPhotos: number;
  errorCode: string | null;
};

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function reportedAtLabel(value: string): string {
  const [date, time = "00:00"] = value.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const monthName = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year} à ${hour}:${minute.slice(0, 2)}`;
}

export function reportedAtParts(value: string): { date: string; time: string } {
  const [date, time] = reportedAtLabel(value).split(" à ");
  return { date, time };
}

const STATES: Record<string, string> = {
  pending: "À traiter",
  assigned: "Affecté",
};

export function stateLabel(state: string): string {
  return STATES[state] ?? state;
}

const QUALITIES: Record<string, string> = {
  READABLE: "Lisible",
  PARTIAL: "Partielle",
  UNREADABLE: "Illisible",
};

export function qualityLabel(quality: string | null): string {
  if (!quality) {
    return "Non définie";
  }
  return QUALITIES[quality] ?? quality;
}

export function confidenceLabel(confidence: number | null): string {
  if (confidence == null) {
    return "Non indiquée";
  }
  return `${Math.round(confidence * 100)} %`;
}

export function readValue(value: string | null): string {
  return value && value.trim() ? value : "Non lu";
}

export function photoRequestStatusLabel(status: string): string {
  if (status === "linked") {
    return "Nouvelle photo rattachée";
  }
  if (status === "open") {
    return "En attente d'une nouvelle photo";
  }
  return status;
}

export function photoRequestBasisLabel(basis: string): string {
  if (basis === "reading") {
    return "La lecture indique que la pièce est illisible.";
  }
  return "Constaté à l'examen de la pièce.";
}

const FINDINGS: Record<string, string> = {
  "non-normalized": "Facture non normalisée",
  "unknown-seller": "Vendeur non identifié",
  "fake-invoice": "Facture ou code non authentique",
  understated: "Facture minorée",
  "missing-transmission": "Défaut d'enregistrement ou de transmission",
  refusal: "Refus de facture",
};

const PROOFS: Record<string, string> = {
  photo: "Photo suffisante",
  register: "Vérification manuelle",
  pending: "Confirmation attendue",
  authority: "Réponse de la DGI",
};

export type SellerFileReport = {
  reportId: string;
  identifier: string;
  reportedAt: string;
  title: string | null;
  decision: string;
  finding: string | null;
  proof: string | null;
  sellerName: string | null;
  justification: string;
  qualifiedAt: string;
};

export type SellerFile = {
  taxId: string | null;
  sellerName: string | null;
  namesDiffer: boolean;
  latestAt: string;
  reports: SellerFileReport[];
};

export type SellerFilePage = {
  items: SellerFile[];
  page: number;
  size: number;
  total: number;
};

export function supervisionResultLabel(result: string): string {
  return result === "upheld" ? "Décision maintenue" : "Dossier renvoyé";
}

export function qualificationDecisionLabel(decision: string): string {
  if (decision === "confirm") {
    return "Constat retenu";
  }
  if (decision === "wait") {
    return "En attente de vérification";
  }
  return "Signalement écarté";
}

export function findingLabel(finding: string | null): string | null {
  if (finding === "nonconform") return "Facture non conforme à l’achat réel";
  if (finding === "vat-unregistered") return "TVA facturée par une entreprise non assujettie";
  if (finding === "verification") return "Vérification requise";
  if (!finding) {
    return null;
  }
  return (VALIDATION_FINDINGS as Record<string, string>)[finding] ?? FINDINGS[finding] ?? finding;
}

export function proofLabel(proof: string | null): string | null {
  if (!proof) {
    return null;
  }
  return PROOFS[proof] ?? proof;
}

export function calendarLabel(value: string): string {
  const [year, month, day] = value.split("-");
  const monthName = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}`;
}

export function duplicateStrengthLabel(strength: string): string {
  return strength === "likely" ? "Doublon probable" : "À vérifier";
}

export function duplicatePriorityLabel(alert: DuplicateAlert): string | null {
  if (alert.status !== "confirmed" || !alert.priorityReportedAt) {
    return null;
  }
  const when = reportedAtLabel(alert.priorityReportedAt);
  if (alert.priorityBasis === "reference") {
    return "Reçus en même temps : la référence la plus petite conserve la priorité.";
  }
  return alert.currentKeepsPriority
    ? "Premier signalement conservé. Le signalement ultérieur est rejeté."
    : `Signalement ultérieur rejeté. Le premier, reçu le ${when}, est conservé.`;
}
