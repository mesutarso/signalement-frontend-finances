import { readOptionalJson } from "@/lib/api";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const update = await readOptionalJson<{ revision: string }>("/api/report-updates");
    return update ? Response.json(update, { headers }) : new Response(null, { status: 401, headers });
  } catch {
    return new Response(null, { status: 502, headers });
  }
}
