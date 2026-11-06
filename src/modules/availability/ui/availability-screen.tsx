import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AvailabilityView } from "@/modules/availability/model/availability";

export function AvailabilityScreen({ view }: { view: AvailabilityView }) {
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-primary">Signalements</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={view.available ? "success" : "destructive"}>
              {view.available ? "Disponible" : "Indisponible"}
            </Badge>
            <p>{view.message}</p>
          </div>
        </div>
        <Button nativeButton={false} render={<a href="/" />}>
          Actualiser
        </Button>
      </div>
    </section>
  );
}
