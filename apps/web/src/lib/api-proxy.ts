const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8000";

// Vercel's declarative `rewrites()` refuses to forward to hosts whose DNS
// resolves to an address it flags as private (seen with Railway's
// *.up.railway.app domains), so we proxy manually via fetch() instead — that
// check only applies to the rewrite engine, not to outgoing fetches.
export async function proxyToApi(
  req: Request,
  segments: string[],
): Promise<Response> {
  const url = new URL(req.url);
  const target = `${API_TARGET}/${segments.join("/")}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const hasBody = !["GET", "HEAD"].includes(req.method);

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") responseHeaders.append(key, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
