export type ReportSummary = {
  id: string;
  identifier: string;
  reportedAt: string;
  title: string | null;
  state: string;
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
  articles: PhotoArticle[];
  errorCode: string | null;
};

export type Assignment = {
  recordedAt: string;
  actorName: string | null;
  assigneeName: string | null;
  previousAssigneeName: string | null;
  priority: string | null;
  state: string;
};

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
};

export type ReportDetail = ReportSummary & {
  assigneeId: string | null;
  description: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  reporterPhone: string | null;
  reporterUserId: string | null;
  photos: ReportPhoto[];
  assignments: Assignment[];
  photoRequests: PhotoRequest[];
  duplicates: DuplicateAlert[];
  qualifications: Qualification[];
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

export type Qualification = {
  id: string;
  decision: string;
  finding: string | null;
  proof: string | null;
  justification: string;
  sellerName: string | null;
  sellerTaxId: string | null;
  issuedOn: string | null;
  amount: string | null;
  documentNumber: string | null;
  code: string | null;
  missingElements: string | null;
  dgiReference: string | null;
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

const STATES: Record<string, string> = {
  pending: "À traiter",
  assigned: "Affecté",
};

const PRIORITIES: Record<string, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export function stateLabel(state: string): string {
  return STATES[state] ?? state;
}

export function priorityLabel(priority: string | null): string {
  if (!priority) {
    return "Non définie";
  }
  return PRIORITIES[priority] ?? priority;
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
    return "En attente de la DGI";
  }
  return "Signalement écarté";
}

export function findingLabel(finding: string | null): string | null {
  if (!finding) {
    return null;
  }
  return FINDINGS[finding] ?? finding;
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
  if (alert.priorityBasis === "complete") {
    return alert.currentKeepsPriority
      ? "La priorité reste à ce signalement, car sa lecture est complète."
      : `La priorité reste au signalement reçu le ${when}.`;
  }
  return alert.currentKeepsPriority
    ? "Aucun des deux n'a encore une lecture complète. La priorité reste à ce signalement, le plus ancien."
    : `Aucun des deux n'a encore une lecture complète. La priorité reste au signalement reçu le ${when}.`;
}
