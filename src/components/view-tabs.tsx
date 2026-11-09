import Link from "next/link";
import { cn } from "cn";

/* Bascule entre vues d'une même liste. Ce sont des liens : la vue se partage et survit au rechargement. */
export function ViewTabs({ label, items }: { label: string; items: { href: string; label: string; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="flex gap-6 overflow-x-auto border-b">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 border-transparent py-2.5 text-sm whitespace-nowrap transition-colors",
            item.active ? "border-primary font-bold text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
