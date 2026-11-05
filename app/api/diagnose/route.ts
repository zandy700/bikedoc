import { getModelConfig } from "@/lib/ai/provider";
import { runDiagnosis } from "@/lib/ai/diagnose";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  const config = getModelConfig(process.env);
  return Response.json(
    config.mode === "ai" ? { mode: "ai", model: `${config.provider}:${config.modelId}` } : { mode: "demo" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Request body must be JSON." }, { status: 400 });
  }
  const result = await runDiagnosis(body);
  return Response.json(result.body, { status: result.status });
}
