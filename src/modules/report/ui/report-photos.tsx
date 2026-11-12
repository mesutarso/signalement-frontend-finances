"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon, MaximizeScreenIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { PhotoRequest, ReportPhoto } from "@/modules/report/model/report";
import { PhotoReading } from "@/modules/report/ui/photo-reading";
import { PhotoRequestPanel } from "@/modules/report/ui/photo-request-panel";

export function ReportPhotos({
  reportId,
  photos,
  photoRequests,
  canRequest,
}: {
  reportId: string;
  photos: ReportPhoto[];
  photoRequests: PhotoRequest[];
  canRequest: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  if (!photos.length) return <Empty className="bg-muted"><EmptyHeader><EmptyTitle>Aucune pièce jointe</EmptyTitle></EmptyHeader></Empty>;
  const photo = photos[selected] ?? photos[0];
  const src = `/signalements/${reportId}/photos/${photo.id}`;
  const isImage = photo.contentType.startsWith("image/");

  function move(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") setSelected((value) => Math.max(0, value - 1));
    if (event.key === "ArrowRight") setSelected((value) => Math.min(photos.length - 1, value + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog.Root>
        <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-md bg-muted sm:h-[480px]">
          {!isImage ? <a href={src} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline underline-offset-4">Ouvrir la pièce jointe</a> : failed === photo.id
            ? <p role="status" className="px-6 text-sm text-muted-foreground">Cette pièce ne peut pas être affichée.</p>
            : <Image key={photo.id} src={src} alt={`Pièce jointe ${selected + 1}`} fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" onError={() => setFailed(photo.id)} className="object-contain p-4" />}
          {isImage ? <Dialog.Trigger render={<Button variant="outline" size="sm" className="absolute top-3 right-3 bg-card" />}>
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
            <div className="relative min-h-0 flex-1">{isImage ? <Image src={src} alt={`Pièce jointe ${selected + 1} agrandie`} fill unoptimized sizes="100vw" className="object-contain" /> : <a href={src} target="_blank" rel="noreferrer" className="underline">Ouvrir la pièce jointe</a>}</div>
            {photos.length > 1 ? (
              <div className="flex justify-center gap-2">
                <Button variant="ghost" className="text-white hover:bg-white/10" disabled={selected === 0} onClick={() => setSelected((value) => value - 1)}><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />Précédente</Button>
                <Button variant="ghost" className="text-white hover:bg-white/10" disabled={selected === photos.length - 1} onClick={() => setSelected((value) => value + 1)}>Suivante<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" /></Button>
              </div>
            ) : null}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {photos.length > 1 ? (
        <div role="group" aria-label="Choisir une pièce jointe" className="flex gap-2 overflow-x-auto p-0.5">
          {photos.map((item, index) => (
            <button key={item.id} type="button" aria-label={`Afficher la pièce ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-muted outline-offset-1 transition-opacity not-aria-pressed:opacity-70 hover:opacity-100 aria-pressed:outline-2 aria-pressed:outline-primary">
              {item.contentType.startsWith("image/") ? <Image src={`/signalements/${reportId}/photos/${item.id}`} alt="" fill unoptimized sizes="56px" className="object-contain p-0.5" /> : <span className="text-xs">Pièce {index + 1}</span>}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 grid gap-7">
        <PhotoReading key={photo.id} reportId={reportId} photo={photo} canRequest={canRequest} />
        <PhotoRequestPanel reportId={reportId} photo={photo} requests={photoRequests} canRequest={canRequest} />
      </div>
    </div>
  );
}
