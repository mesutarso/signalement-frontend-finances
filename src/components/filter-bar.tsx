import Form from "next/form";
import Link from "next/link";
import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FilterBar({
  action,
  label,
  children,
  secondary,
  advanced,
  clearHref,
  submitLabel = "Appliquer",
}: {
  action: string;
  label: string;
  children: ReactNode;
  secondary?: ReactNode;
  advanced?: { fields: ReactNode; count: number };
  clearHref?: string;
  submitLabel?: string;
}) {
  const fields = (
    <FieldGroup className={cn(
      "grid items-end gap-3",
      secondary
        ? "@sm:grid-cols-2 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_auto]"
        : "@lg:grid-cols-[minmax(0,1fr)_auto]"
    )}>
      {children}
      {secondary}
      <div className={cn("flex flex-wrap gap-2", secondary && "col-span-full @3xl:col-span-1")}>
        {advanced ? (
          <Collapsible.Trigger render={<Button variant="outline" className="h-11" />} type="button">
            <HugeiconsIcon icon={FilterHorizontalIcon} data-icon="inline-start" aria-hidden="true" />
            Filtres avancés{advanced.count > 0 ? ` (${advanced.count})` : ""}
          </Collapsible.Trigger>
        ) : null}
        <Button type="submit" className="h-11">{submitLabel}</Button>
        {clearHref ? (
          <Button variant="ghost" className="h-11" nativeButton={false} render={<Link href={clearHref} />}>Effacer</Button>
        ) : null}
      </div>
    </FieldGroup>
  );

  return (
    <Form action={action} aria-label={label} className="@container min-w-0">
      {advanced ? (
        <Collapsible.Root className="grid gap-3">
          {fields}
          <Collapsible.Panel keepMounted className="rounded-md border bg-muted/30 p-4">
            {advanced.fields}
          </Collapsible.Panel>
        </Collapsible.Root>
      ) : fields}
    </Form>
  );
}

export function FilterDateRange({
  from,
  to,
  legend = "Plage de dates",
  className,
}: {
  from: { name: string; value?: string };
  to: { name: string; value?: string };
  legend?: string;
  className?: string;
}) {
  return (
    <FieldSet className={cn("min-w-0", className)}>
      <FieldLegend>{legend}</FieldLegend>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field className="min-w-0">
          <FieldLabel htmlFor={`filter-${from.name}`}>Du</FieldLabel>
          <Input id={`filter-${from.name}`} name={from.name} type="date" defaultValue={from.value} />
        </Field>
        <Field className="min-w-0">
          <FieldLabel htmlFor={`filter-${to.name}`}>Au</FieldLabel>
          <Input id={`filter-${to.name}`} name={to.name} type="date" defaultValue={to.value} />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
