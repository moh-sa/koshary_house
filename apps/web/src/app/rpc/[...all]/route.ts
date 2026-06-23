import { proxyToApi } from "@/lib/api-proxy";

async function handler(
  req: Request,
  { params }: { params: Promise<{ all: string[] }> },
): Promise<Response> {
  const { all } = await params;
  return proxyToApi(req, ["rpc", ...all]);
}

export { handler as GET, handler as POST };
