"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowLeftDoubleIcon, ArrowRight01Icon, ArrowRightDoubleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

type Icon = typeof ArrowLeft01Icon;

export function TablePagination({ page, size, total, label }: { page: number; size: number; total: number; label: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const count = Math.max(1, Math.ceil(total / size));
  const start = Math.max(0, Math.min(page - 2, count - 5));
  const pages = Array.from({ length: Math.min(5, count) }, (_, index) => start + index);

  function href(index: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(index));
    return `${pathname}?${params}`;
  }

  function control(text: string, icon: Icon, index: number, disabled: boolean) {
    const glyph = <HugeiconsIcon icon={icon} strokeWidth={2} />;
    return disabled
      ? <Button variant="ghost" size="icon-sm" disabled aria-label={text}>{glyph}</Button>
      : <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={href(index)} />} aria-label={text}>{glyph}</Button>;
  }

  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <p className="text-[13px] text-muted-foreground tabular-nums" aria-live="polite">
        {total === 0 ? "0" : `${page * size + 1}–${Math.min((page + 1) * size, total)}`} sur {total.toLocaleString("fr-FR")}
      </p>
      {count > 1 ? (
        <div className="flex flex-wrap items-center gap-0.5">
          {control("Première page", ArrowLeftDoubleIcon, 0, page === 0)}
          {control("Page précédente", ArrowLeft01Icon, page - 1, page === 0)}
          {start > 0 ? <span aria-hidden="true" className="px-1 text-muted-foreground">…</span> : null}
          {pages.map((index) => (
            <Button key={index} variant={index === page ? "default" : "ghost"} size="icon-sm" nativeButton={false} render={<Link href={href(index)} />} aria-label={`Page ${index + 1}`} aria-current={index === page ? "page" : undefined} className="tabular-nums">
              {index + 1}
            </Button>
          ))}
          {start + pages.length < count ? <span aria-hidden="true" className="px-1 text-muted-foreground">…</span> : null}
          {control("Page suivante", ArrowRight01Icon, page + 1, page >= count - 1)}
          {control("Dernière page", ArrowRightDoubleIcon, count - 1, page >= count - 1)}
        </div>
      ) : null}
    </nav>
  );
}
