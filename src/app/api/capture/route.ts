import { captureTokenMatches, saveCapturedPosting } from "@/lib/capture";

const headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

/** The extension asks permission to send the token. */
export function OPTIONS() {
  return new Response(null, { headers });
}

/** Saves a posting the browser extension sends. The token is the one in Settings → Job search. */
export async function POST(request: Request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!(await captureTokenMatches(token))) {
    return Response.json({ error: "That token doesn't match Settings → Job search." }, { status: 401, headers });
  }
  const body = (await request.json().catch(() => null)) as { text?: unknown; url?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "There's no posting text." }, { status: 400, headers });
  const url = typeof body?.url === "string" ? body.url : "";
  const application = await saveCapturedPosting(text, url);
  return Response.json({ id: application.id }, { headers });
}
