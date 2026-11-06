"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  function control(text: string, index: number, disabled: boolean) {
    return disabled ? <Button variant="outline" size="sm" disabled>{text}</Button> : <Button variant="outline" size="sm" nativeButton={false} render={<Link href={href(index)} />}>{text}</Button>;
  }

  return (
    <nav aria-label={label} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
        <span>{total === 0 ? "0" : `${page * size + 1}–${Math.min((page + 1) * size, total)}`} sur {total}</span>
        <span>Page {page + 1} sur {count}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {control("Première", 0, page === 0)}
        {control("Précédente", page - 1, page === 0)}
        {start > 0 ? <span aria-hidden="true" className="px-1 text-muted-foreground">…</span> : null}
        {pages.map((index) => <Button key={index} variant={index === page ? "default" : "outline"} size="sm" nativeButton={false} render={<Link href={href(index)} />} aria-label={`Page ${index + 1}`} aria-current={index === page ? "page" : undefined}>{index + 1}</Button>)}
        {start + pages.length < count ? <span aria-hidden="true" className="px-1 text-muted-foreground">…</span> : null}
        {control("Suivante", page + 1, page >= count - 1)}
        {control("Dernière", count - 1, page >= count - 1)}
      </div>
    </nav>
  );
}
