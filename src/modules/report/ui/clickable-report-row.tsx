"use client";

import type { ReactNode } from "react";
import { TableRow } from "@/components/ui/table";

export function ClickableReportRow({ children }: { children: ReactNode }) {
  return <TableRow className="cursor-pointer hover:bg-muted/60 focus-within:bg-muted/60" onClick={(event) => {
    if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea")) return;
    const selection = window.getSelection();
    if (selection?.anchorNode && !selection.isCollapsed && event.currentTarget.contains(selection.anchorNode)) return;
    event.currentTarget.querySelector("a")?.click();
  }}>{children}</TableRow>;
}
