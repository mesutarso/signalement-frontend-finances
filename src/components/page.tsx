import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";

/* Ossature commune des pages : même marge, même rythme vertical, mêmes niveaux de titre. */
export function Page({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("flex w-full flex-col gap-10 md:gap-12", className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  compact,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="grid gap-4">
      {back ? (
        <Link href={back.href} className="flex w-fit items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-3.5" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 lg:flex-nowrap">
        <div className={cn("grid min-w-0 gap-3", compact ? "max-w-4xl" : "max-w-3xl")}>
          <h1 className={cn("leading-[1.12] font-medium tracking-[-0.02em] break-words", compact ? "text-[1.75rem] md:text-[2.125rem]" : "text-[2rem] md:text-[2.625rem]")}>{title}</h1>
          {description ? <p className="max-w-[68ch] text-[15px] leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="grid gap-1">
          <h2 className="text-[1.3125rem] leading-tight font-medium tracking-[-0.01em]">{title}</h2>
          {description ? <p className="max-w-[68ch] text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function PageSkeleton() {
  return (
    <div aria-hidden="true" className="flex w-full flex-col gap-12">
      <div className="grid gap-3">
        <Skeleton className="h-11 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-0 border-t border-foreground/20">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className="flex items-center justify-between gap-8 border-b py-4">
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
