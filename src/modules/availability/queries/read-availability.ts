import { connection } from "next/server";
import { readJson } from "@/lib/api";
import { toAvailability, type AvailabilityView } from "@/modules/availability/model/availability";

export async function readAvailability(): Promise<AvailabilityView> {
  await connection();
  try {
    const body = await readJson<{ available?: boolean }>("/api/availability");
    return toAvailability(body);
  } catch {
    return toAvailability(null);
  }
}
