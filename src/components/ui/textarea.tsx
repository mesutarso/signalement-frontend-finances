import type { ComponentProps } from "react";
import { cn } from "cn";
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("min-h-24 w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50 md:text-[15px]",className)} {...props} />;
}
