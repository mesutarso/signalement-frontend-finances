import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

function ShellFallback() {
  return (
    <div className="flex min-h-svh bg-sidebar">
      <div className="hidden w-64 border-r bg-card md:block" />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b bg-card px-4">
          <Skeleton className="h-8 w-48" />
        </header>
        <div className="px-6 py-8 md:px-10">
          <Skeleton className="h-9 w-56" />
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellFallback />}><AppShell>{children}</AppShell></Suspense>;
}
