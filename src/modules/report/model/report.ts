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
};

export type Assignment = {
  recordedAt: string;
  actorName: string | null;
  assigneeName: string | null;
  previousAssigneeName: string | null;
  priority: string | null;
  state: string;
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
