"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
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
  if (!photos.length) return <Empty><EmptyHeader><EmptyTitle>Aucune pièce jointe</EmptyTitle></EmptyHeader></Empty>;
  const photo = photos[selected] ?? photos[0];
  const src = `/signalements/${reportId}/photos/${photo.id}`;
  return (
    <div className="flex flex-col gap-4">
      <Dialog.Root>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">Pièce {selected + 1} sur {photos.length}</p>
          <Dialog.Trigger render={<Button variant="outline" size="sm" />}>Agrandir la pièce</Dialog.Trigger>
        </div>
        <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-lg bg-muted sm:h-[460px]">
          {failed === photo.id ? <p role="status" className="px-6 text-sm text-muted-foreground">Cette pièce ne peut pas être affichée.</p> : <Image key={photo.id} src={src} alt={`Pièce jointe ${selected + 1}`} fill unoptimized sizes="(max-width: 1024px) 100vw, 65vw" onError={() => setFailed(photo.id)} className="object-contain p-4" />}
        </div>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Popup className="fixed inset-4 z-50 flex flex-col gap-4 rounded-xl bg-card p-4 text-card-foreground shadow-xl sm:inset-8 sm:p-6">
            <div className="flex items-center justify-between gap-4"><Dialog.Title className="font-bold">Pièce {selected + 1} sur {photos.length}</Dialog.Title><Dialog.Close render={<Button variant="outline" size="sm" />}>Fermer</Dialog.Close></div>
            <div className="relative min-h-0 flex-1"><Image src={src} alt={`Pièce jointe ${selected + 1} agrandie`} fill unoptimized sizes="100vw" className="object-contain" /></div>
            <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" size="sm" disabled={selected === 0} onClick={() => setSelected((value) => value - 1)}>Précédente</Button><Button variant="outline" size="sm" disabled={selected === photos.length - 1} onClick={() => setSelected((value) => value + 1)}>Suivante</Button></div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {photos.length > 1 ? <div aria-label="Choisir une pièce jointe" className="flex gap-2 overflow-x-auto pb-2">{photos.map((item, index) => <button key={item.id} type="button" aria-label={`Afficher la pièce ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md border bg-muted aria-pressed:ring-2 aria-pressed:ring-foreground"><Image src={`/signalements/${reportId}/photos/${item.id}`} alt="" fill unoptimized sizes="96px" className="object-contain p-1" /></button>)}</div> : null}
      <PhotoReading key={photo.id} reportId={reportId} photo={photo} canRequest={canRequest} />
      <PhotoRequestPanel reportId={reportId} photo={photo} requests={photoRequests} canRequest={canRequest} />
    </div>
  );
}
