export type ReportSummary = {
  id: string;
  identifier: string;
  reportedAt: string;
  title: string | null;
  state: string;
  validationState: string;
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

const READING_ERRORS: Record<string, string> = {
  "not-configured": "Le service de lecture n’est pas configuré. Contactez l’administrateur.",
  "rejected-token": "L’accès au service de lecture est refusé. Contactez l’administrateur.",
  "rejected-document": "Le service n’a pas pu traiter cette pièce. Consultez l’image ou demandez une nouvelle photo.",
  "too-large": "Cette pièce dépasse la limite de lecture de 5 Mio.",
  "rejected-type": "La lecture accepte les images JPEG, PNG et WebP.",
  quota: "Le quota du service de lecture est atteint. Réessayez plus tard.",
  timeout: "Le service de lecture a mis trop de temps à répondre. Vous pouvez réessayer.",
  "unexpected-response": "La réponse du service de lecture est inexploitable. Vous pouvez réessayer.",
  "provider-error": "Le service de lecture a rencontré une erreur. Vous pouvez réessayer.",
  unavailable: "Le service de lecture est momentanément inaccessible. Consultez la pièce jointe.",
};

export function readingErrorLabel(code: string | null): string {
  return (code && READING_ERRORS[code]) || "La lecture a échoué. Vous pouvez réessayer.";
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
};

export type ReportDetail = ReportSummary & {
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
