"use client";

import { useState, type ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

export type InstructionTab = {
  value: string;
  label: string;
  count?: number;
  attention?: boolean;
  content: ReactNode;
};

/* Les étapes du dossier, une à la fois. Les panneaux restent montés : changer d'onglet ne perd aucune saisie. */
export function ReportInstruction({ tabs, notice }: { tabs: InstructionTab[]; notice?: { tab: string; text: string } }) {
  const [value, setValue] = useState(tabs[0].value);

  return (
    <div className="grid min-w-0 content-start gap-4">
      {notice && value !== notice.tab ? (
        <button
          type="button"
          onClick={() => setValue(notice.tab)}
          className="flex items-center gap-2.5 rounded-md bg-warning-soft px-3 py-2.5 text-left text-sm text-warning transition-colors hover:bg-[#fae9b8]"
        >
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} className="size-4 shrink-0" />
          <span className="flex-1">{notice.text}</span>
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0" />
        </button>
      ) : null}
      <Tabs.Root value={value} onValueChange={(next) => setValue(String(next))} className="min-w-0">
        <Tabs.List aria-label="Instruction du dossier" className="relative flex gap-5 overflow-x-auto border-y border-b-border border-t-foreground">
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              className="flex h-11 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground data-[active]:font-bold data-[active]:text-primary"
            >
              {tab.label}
              {tab.count ? (
                <span className={cn("min-w-[18px] rounded-sm px-1 text-center text-xs leading-[18px] font-medium tabular-nums", tab.attention ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground")}>{tab.count}</span>
              ) : null}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator renderBeforeHydration className="absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-primary transition-[translate,width] duration-200 ease-out" />
        </Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} keepMounted className="pt-5 outline-none">
            {tab.content}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </div>
  );
}
