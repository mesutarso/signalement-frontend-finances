import { readBytes } from "@/lib/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; responseId: string }> },
) {
  const { id, responseId } = await context.params;
  const file = await readBytes(`/api/letters/${id}/responses/${responseId}`);
  if (!file) {
    return new Response(null, { status: 404 });
  }
  const name = file.contentType.includes("pdf") ? "reponse.pdf" : file.contentType.includes("png") ? "reponse.png" : file.contentType.includes("webp") ? "reponse.webp" : "reponse.jpg";
  return new Response(file.body, {
    headers: {
      "content-type": file.contentType,
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "private, no-store",
    },
  });
}
