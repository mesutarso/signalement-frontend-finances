import { readJson } from "@/lib/api";
import type { Assignee } from "@/modules/report/model/report";

export function readAssignees(): Promise<Assignee[]> {
  return readJson<Assignee[]>("/api/reports/assignees");
}
