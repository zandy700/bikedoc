export type ModelConfig =
  | { mode: "ai"; provider: "openai" | "anthropic"; modelId: string }
  | { mode: "demo" };

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";

type Env = Record<string, string | undefined>;

/**
 * Choose the diagnosis model from environment variables.
 * OPENAI_API_KEY wins over ANTHROPIC_API_KEY; BIKEDOC_MODEL overrides the model id.
 * No key -> demo mode (rule-based engine).
 */
export function getModelConfig(env: Env = process.env): ModelConfig {
  const override = env.BIKEDOC_MODEL?.trim() || undefined;
  if (env.OPENAI_API_KEY?.trim()) {
    return { mode: "ai", provider: "openai", modelId: override ?? DEFAULT_OPENAI_MODEL };
  }
  if (env.ANTHROPIC_API_KEY?.trim()) {
    return { mode: "ai", provider: "anthropic", modelId: override ?? DEFAULT_ANTHROPIC_MODEL };
  }
  return { mode: "demo" };
}
