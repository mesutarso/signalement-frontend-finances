"use client";

import Image from "next/image";
import { useState, type ComponentProps, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import { Tabs } from "@base-ui/react/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, MaximizeScreenIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { PageHeader } from "@/components/page";
import type { PhotoRequest, ReportPhoto } from "@/modules/report/model/report";
import { PhotoReading } from "@/modules/report/ui/photo-reading";
import { PhotoRequestPanel } from "@/modules/report/ui/photo-request-panel";

const tabClassName = "shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-active:border-primary data-active:text-primary";

export function ReportWorkspace({
  header,
  assignment,
  reviewAction,
  reportId,
  photos,
  photoRequests,
  canRequest,
  analysisPhotoId,
  analysisPending,
  information,
  analysis,
  administration,
  showAdministration,
}: {
  header: Omit<ComponentProps<typeof PageHeader>, "actions">;
  assignment: ReactNode;
  reviewAction: { label: string; target: string } | null;
  reportId: string;
  photos: ReportPhoto[];
  photoRequests: PhotoRequest[];
  canRequest: boolean;
  analysisPhotoId?: string | null;
  analysisPending: boolean;
  information: ReactNode;
  analysis: ReactNode;
  administration: ReactNode;
  showAdministration?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tabs.Tab.Value>(showAdministration && administration ? "administration" : "signalement");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const analysisIndex = photos.findIndex((photo) => photo.id === analysisPhotoId);
  const selectedIndex = photos.findIndex((photo) => photo.id === selectedId);
  const selected = selectedIndex < 0 ? Math.max(0, analysisIndex) : selectedIndex;
  const photo = photos[selected];

  function openAnalysis() {
    if (!reviewAction) return;
    if (activeTab !== "analysis") flushSync(() => setActiveTab("analysis"));
    document.getElementById(reviewAction.target)?.focus();
  }

  return (
    <>
      <PageHeader {...header} actions={reviewAction || assignment ? (
        <>
          {reviewAction ? <Button type="button" onClick={openAnalysis}>{reviewAction.label}</Button> : null}
          {assignment}
        </>
      ) : null} />
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]">
        <section aria-labelledby="report-attachments" className="grid min-w-0 content-start gap-3 rounded-lg border bg-card p-4 sm:p-5 xl:sticky xl:top-20">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="grid gap-1">
              <h2 id="report-attachments" className="text-base leading-tight font-semibold">Facture</h2>
              {analysisIndex >= 0 ? (
                <p className="text-xs text-muted-foreground">
                  {selected === analysisIndex ? "Pièce utilisée pour l’analyse" : `Pièce analysée : ${analysisIndex + 1}`}
                </p>
              ) : null}
            </div>
            {analysisIndex >= 0 && selected !== analysisIndex ? (
              <Button size="sm" type="button" variant="outline" onClick={() => setSelectedId(null)}>Voir la pièce analysée</Button>
            ) : null}
          </div>
          {photo ? (
            <ReportPhotos reportId={reportId} photos={photos} photo={photo} selected={selected}
              onSelect={(index) => setSelectedId(photos[index]?.id ?? null)} />
          ) : (
            <Empty className="min-h-44 bg-muted"><EmptyHeader><EmptyTitle>Aucune pièce jointe</EmptyTitle></EmptyHeader></Empty>
          )}
        </section>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="min-w-0 rounded-lg border bg-card">
          <Tabs.List aria-label="Informations du dossier" className="flex min-w-0 overflow-x-auto border-b px-2">
            <Tabs.Tab value="signalement" className={tabClassName}>Signalement</Tabs.Tab>
            <Tabs.Tab value="ocr" className={tabClassName}>OCR</Tabs.Tab>
            <Tabs.Tab value="analysis" className={tabClassName}>Analyse automatique</Tabs.Tab>
            {administration ? <Tabs.Tab value="administration" className={tabClassName}>Suivi administratif</Tabs.Tab> : null}
          </Tabs.List>
          <Tabs.Panel value="signalement" className="min-w-0 p-4 sm:p-5">{information}</Tabs.Panel>
          <Tabs.Panel value="ocr" className="min-w-0 p-4 sm:p-5">
            {photo ? (
              <div className="grid min-w-0 gap-4">
                <PhotoReading key={photo.id} photo={photo} loading={analysisPending}
                  pieceNumber={photos.length > 1 ? selected + 1 : undefined} />
                <PhotoRequestPanel reportId={reportId} photo={photo} requests={photoRequests} canRequest={canRequest} />
              </div>
            ) : <p className="text-sm text-muted-foreground">Aucune pièce jointe.</p>}
          </Tabs.Panel>
          <Tabs.Panel value="analysis" keepMounted className="min-w-0 p-4 sm:p-5">{analysis}</Tabs.Panel>
          {administration ? (
            <Tabs.Panel value="administration" keepMounted className="min-w-0 p-4 sm:p-5">{administration}</Tabs.Panel>
          ) : null}
        </Tabs.Root>
      </div>
    </>
  );
}

function ReportPhotos({ reportId, photos, photo, selected, onSelect }: {
  reportId: string;
  photos: ReportPhoto[];
  photo: ReportPhoto;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const src = `/signalements/${reportId}/photos/${photo.id}`;
  const isImage = photo.contentType.startsWith("image/");

  function move(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") onSelect(Math.max(0, selected - 1));
    if (event.key === "ArrowRight") onSelect(Math.min(photos.length - 1, selected + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog.Root>
        <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-md border bg-muted sm:h-96 xl:h-[28rem]">
          {!isImage ? <Button variant="outline" nativeButton={false} render={<a href={src} target="_blank" rel="noreferrer" />}>Ouvrir la pièce jointe</Button> : failed === photo.id
            ? <p role="status" className="px-6 text-sm text-muted-foreground">Cette pièce ne peut pas être affichée.</p>
            : <Image key={photo.id} src={src} alt={`Pièce jointe ${selected + 1}`} fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" onError={() => setFailed(photo.id)} className="object-contain p-4" />}
          {isImage && failed !== photo.id ? <Dialog.Trigger render={<Button variant="outline" size="sm" className="absolute top-3 right-3 bg-card" />}>
            <HugeiconsIcon icon={MaximizeScreenIcon} strokeWidth={1.75} data-icon="inline-start" />
            Agrandir
          </Dialog.Trigger> : null}
          {photos.length > 1 ? <p className="absolute bottom-3 left-3 rounded-sm bg-card px-1.5 py-0.5 text-xs tabular-nums" aria-live="polite">Pièce {selected + 1} sur {photos.length}</p> : null}
        </div>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-[var(--fin-ink)]/95 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup onKeyDown={move} className="fixed inset-0 z-50 flex flex-col gap-2 p-3 text-white outline-none transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <Dialog.Title className="text-sm tabular-nums">Pièce {selected + 1} sur {photos.length}</Dialog.Title>
              <Dialog.Close aria-label="Fermer" render={<Button variant="ghost" size="icon" className="text-white hover:bg-white/10" />}><HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} /></Dialog.Close>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {isImage ? <Image src={src} alt={`Pièce jointe ${selected + 1} agrandie`} fill unoptimized sizes="100vw" className="object-contain" /> : (
                <Button variant="secondary" nativeButton={false} render={<a href={src} target="_blank" rel="noreferrer" />}>Ouvrir la pièce jointe</Button>
              )}
            </div>
            {photos.length > 1 ? (
              <div className="flex justify-center gap-2">
                <Button variant="ghost" className="text-white hover:bg-white/10" disabled={selected === 0} onClick={() => onSelect(selected - 1)}><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />Précédente</Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" disabled={selected === photos.length - 1} onClick={() => onSelect(selected + 1)}>Suivante<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" /></Button>
              </div>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {photos.length > 1 ? (
        <div role="group" aria-label="Choisir une pièce jointe" className="flex gap-2 overflow-x-auto p-0.5">
          {photos.map((item, index) => (
            <button key={item.id} type="button" aria-label={`Afficher la pièce ${index + 1}`} aria-pressed={selected === index} onClick={() => onSelect(index)} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-muted outline-offset-1 transition-opacity not-aria-pressed:opacity-70 hover:opacity-100 aria-pressed:outline-2 aria-pressed:outline-foreground">
              {item.contentType.startsWith("image/") ? <Image src={`/signalements/${reportId}/photos/${item.id}`} alt="" fill unoptimized sizes="56px" className="object-contain p-0.5" /> : <span className="text-xs">Pièce {index + 1}</span>}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
