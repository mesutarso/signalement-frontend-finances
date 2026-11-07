import { readBytes } from "@/lib/api";

const NAMES: Record<string, string> = {
  company: "entreprises.csv",
  invoice: "factures.csv",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; annex: string }> },
) {
  const { id, annex } = await context.params;
  const file = await readBytes(`/api/letters/${id}/annexes?annex=${annex}`);
  if (!file) {
    return new Response(null, { status: 404 });
  }
  return new Response(file.body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${NAMES[annex] ?? "annexe.csv"}"`,
      "cache-control": "private, no-store",
    },
  });
}
