import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { priorityLabel, stateLabel } from "@/modules/report/model/report";

export function StateTag({ state }: { state: string }) {
  return <Badge variant={state === "pending" ? "warning" : "secondary"}>{stateLabel(state)}</Badge>;
}

const LEVELS: Record<string, number> = { low: 1, normal: 2, high: 3, urgent: 4 };

export function PriorityMark({ priority }: { priority: string | null }) {
  const level = priority ? LEVELS[priority] ?? 0 : 0;
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] whitespace-nowrap", priority === "urgent" ? "font-medium text-destructive" : !priority && "text-muted-foreground")}>
      <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <span key={bar} className={cn("w-[3px] rounded-[1px]", bar <= level ? "bg-current" : "bg-input")} style={{ height: 3 * bar }} />
        ))}
      </span>
      {priorityLabel(priority)}
    </span>
  );
}
