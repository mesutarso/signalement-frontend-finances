import { Badge } from "@/components/ui/badge";
import { stateLabel } from "@/modules/report/model/report";
import { validationLabel, VALIDATION_STATES, SCREENING_REASONS } from "@/modules/report/model/assessment";

export function ValidationTag({ state, assignmentState, screeningReason }: { state: string; assignmentState?: string; screeningReason?: string | null }) {
  if (!VALIDATION_STATES[state]) return assignmentState ? <StateTag state={assignmentState} /> : null;
  return <span className="inline-flex flex-col items-start gap-1"><Badge variant={state === "validated" ? "success" : state === "doubt" ? "warning" : state === "rejected" ? "destructive" : "outline"}>{state === "doubt" && (screeningReason === "unreadable" || screeningReason === "identity-missing") ? "À compléter" : validationLabel(state)}</Badge>{(state === "rejected" || state === "doubt") && screeningReason && SCREENING_REASONS[screeningReason] ? <span className="text-xs text-muted-foreground">{SCREENING_REASONS[screeningReason]}</span> : null}</span>;
}

export function StateTag({ state }: { state: string }) {
  return <Badge variant={state === "pending" ? "warning" : "secondary"}>{stateLabel(state)}</Badge>;
}
