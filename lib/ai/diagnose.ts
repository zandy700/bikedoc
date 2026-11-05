/**
 * Server-only diagnosis entry point. Do not import from client components:
 * it reads API keys from the environment.
 */
import { generateObject, type LanguageModel, type UserContent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { getModelConfig } from "@/lib/ai/provider";
import { diagnoseByRules } from "@/lib/diagnosis/rules";
import {
  diagnoseRequestSchema,
  diagnosisSchema,
  type DiagnoseResponse,
  type Diagnosis,
} from "@/lib/diagnosis/schema";
import { GUIDES } from "@/lib/guides";

type Env = Record<string, string | undefined>;

export const AI_TIMEOUT_MS = 25_000;

export const FALLBACK_NOTICE =
  "The AI diagnosis was unavailable, so this result comes from the rule-based demo engine.";

const GUIDE_LIST = GUIDES.map((g) => `- ${g.id}: ${g.title} (${g.category})`).join("\n");

export const SYSTEM_PROMPT = `You are an expert bicycle mechanic who trains volunteers at a community workshop that refurbishes donated bikes for shipment overseas. Triage the bike from the volunteer's description and/or photo.

Rules:
- Report only problems supported by the description or clearly visible in the photo. Do not invent faults.
- Be honest about uncertainty: confidence is 0-1; use low values (under 0.5) when the evidence is weak or the photo is unclear. If nothing can be determined, say so in the summary and return a single low-confidence "full safety inspection" issue.
- category must be one of: gearing, brakes, frame, wheels, chain, other. Use "wheels" for hub bearings and "other" for bottom brackets and headsets.
- guideId must be one of the ids below, or null if no guide fits. Never use any other id.
${GUIDE_LIST}
- evidence: one or two sentences quoting the symptom or describing what is visible that supports the issue.
- Safety first: any suspected crack, bend or dent in the frame or fork, or any damage on a carbon frame/fork, must be reported as a frame issue with the advice that the bike must not be shipped until inspected (carbon: retire or refer to a specialist). Brake work must be checked by a second mechanic.
- Order issues from most to least likely. At most 8 issues. Keep the summary under 400 characters, plain language for volunteers.`;

function createModel(provider: "openai" | "anthropic", modelId: string, env: Env): LanguageModel {
  if (provider === "openai") return createOpenAI({ apiKey: env.OPENAI_API_KEY?.trim() })(modelId);
  return createAnthropic({ apiKey: env.ANTHROPIC_API_KEY?.trim() })(modelId);
}

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data URL");
  return { mediaType: match[1], data: match[2] };
}

function buildContent(description: string, image: string | undefined): UserContent {
  const text = description
    ? `Volunteer's description of the bike:\n"""\n${description}\n"""`
    : "No description was provided. Diagnose from the photo only.";
  const parts: Exclude<UserContent, string> = [{ type: "text", text }];
  if (image) {
    const { mediaType, data } = parseDataUrl(image);
    parts.push({ type: "file", mediaType, data: { type: "data", data } });
  }
  return parts;
}

function tidy(d: Diagnosis): Diagnosis {
  return {
    summary: d.summary,
    issues: [...d.issues].sort((a, b) => b.confidence - a.confidence).slice(0, 8),
  };
}

/** Never throws. Returns an HTTP status and a JSON-serialisable body. */
export async function runDiagnosis(
  body: unknown,
  env: Env = process.env,
): Promise<{ status: number; body: DiagnoseResponse }> {
  const parsed = diagnoseRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request";
    return { status: 400, body: { ok: false, error: message } };
  }
  const { description, image } = parsed.data;
  const rules = () => diagnoseByRules({ description, hasImage: image !== undefined });

  let config: ReturnType<typeof getModelConfig>;
  try {
    config = getModelConfig(env);
  } catch {
    config = { mode: "demo" };
  }
  if (config.mode === "demo") {
    return { status: 200, body: { ok: true, mode: "demo", diagnosis: rules() } };
  }

  const modelName = `${config.provider}:${config.modelId}`;
  try {
    const result = await generateObject({
      model: createModel(config.provider, config.modelId, env),
      instructions: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildContent(description, image) }],
      schema: diagnosisSchema,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    const diagnosis = tidy(diagnosisSchema.parse(result.object));
    return { status: 200, body: { ok: true, mode: "ai", model: modelName, diagnosis } };
  } catch (error) {
    console.error(
      `[bikedoc] AI diagnosis failed (${modelName}):`,
      error instanceof Error ? error.message : String(error),
    );
    return {
      status: 200,
      body: { ok: true, mode: "demo", notice: FALLBACK_NOTICE, diagnosis: rules() },
    };
  }
}
