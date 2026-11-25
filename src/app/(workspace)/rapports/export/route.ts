import { readBytes } from "@/lib/api";
import { operationalReportQuery } from "@/modules/report/model/operational-report";

const headers = { "cache-control": "private, no-store" };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = operationalReportQuery(key => params.get(key));
  try {
    const file = await readBytes(`/api/operational-reports/export?${query}`);
    if (!file) return new Response(null, { status: 404, headers });
    return new Response(file.body, {
      headers: {
        ...headers,
        "content-type": file.contentType,
        "content-disposition": 'attachment; filename="rapport-signalements.csv"',
      },
    });
  } catch {
    return new Response(null, { status: 502, headers });
  }
}
