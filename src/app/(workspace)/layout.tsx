import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PageSkeleton } from "@/components/page";

function ShellFallback() {
  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden w-[16.5rem] shrink-0 bg-sidebar md:block" />
      <div className="flex flex-1 flex-col">
        <header className="h-14 border-b" />
        <div className="px-4 pt-8 sm:px-6 md:px-10 md:pt-12 lg:px-14"><PageSkeleton /></div>
      </div>
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellFallback />}><AppShell>{children}</AppShell></Suspense>;
}
