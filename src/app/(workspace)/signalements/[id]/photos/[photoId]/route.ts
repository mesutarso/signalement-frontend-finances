import { readBytes } from "@/lib/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await context.params;
  const photo = await readBytes(`/api/reports/${id}/photos/${photoId}`);
  if (!photo) {
    return new Response(null, { status: 404 });
  }
  return new Response(photo.body, {
    headers: {
      "content-type": photo.contentType,
      "cache-control": "private, no-store",
    },
  });
}
