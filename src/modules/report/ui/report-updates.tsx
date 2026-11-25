"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const ROUTES = ["/signalements", "/dossiers-valides", "/declarants", "/dossiers", "/contribuables", "/recompenses", "/paiements", "/indicateurs", "/rapports"];

export function ReportUpdates() {
  const pathname = usePathname();
  const router = useRouter();
  const watched = ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const revision = useRef<string | null>(null);

  useEffect(() => {
    if (!watched) return;
    const controller = new AbortController();
    let pending = false;

    async function check() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const response = await fetch("/api/report-updates", {
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
        });
        if (!response.ok || controller.signal.aborted) return;
        const update = await response.json() as { revision: string };
        if (!controller.signal.aborted && typeof update.revision === "string" && update.revision !== revision.current) {
          revision.current = update.revision;
          router.refresh();
        }
      } catch {
        // A temporary outage is retried at the next check.
      } finally {
        pending = false;
      }
    }

    void check();
    const timer = window.setInterval(check, 10000);
    document.addEventListener("visibilitychange", check);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [router, watched]);

  return null;
}
