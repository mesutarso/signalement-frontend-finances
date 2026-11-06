export type AvailabilityView = {
  available: boolean;
  message: string;
};

export function toAvailability(body: { available?: boolean } | null): AvailabilityView {
  if (body?.available) {
    return { available: true, message: "La plateforme répond." };
  }
  return {
    available: false,
    message: "La plateforme ne répond pas. Réessayez dans un instant.",
  };
}
