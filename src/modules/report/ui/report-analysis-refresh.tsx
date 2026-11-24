"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { startReportAnalysis } from "@/modules/report/actions/review-assessment";

export function ReportAnalysisRefresh({ reportId, prioritize }: { reportId: string; prioritize: boolean }) {
  const router = useRouter();
  const request = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (document.hidden) return;
      if (prioritize) {
        request.current ??= startReportAnalysis(reportId).catch(() => false);
        const pending = request.current;
        if (!(await pending) && request.current === pending) request.current = null;
      }
      if (active) router.refresh();
    }

    if (prioritize) void refresh();
    const timer = window.setInterval(refresh, 10000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [prioritize, reportId, router]);

  return null;
}
