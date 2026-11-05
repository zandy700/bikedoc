/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { DEFAULT_ANTHROPIC_MODEL, DEFAULT_OPENAI_MODEL, getModelConfig } from "./provider";

describe("getModelConfig", () => {
  it("returns demo mode when no keys are set", () => {
    expect(getModelConfig({})).toEqual({ mode: "demo" });
  });

  it("returns demo mode for empty-string keys", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "" })).toEqual({ mode: "demo" });
  });

  it("ignores whitespace-only keys", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "   ", ANTHROPIC_API_KEY: "\n\t" })).toEqual({ mode: "demo" });
  });

  it("falls through a whitespace OpenAI key to Anthropic", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "  ", ANTHROPIC_API_KEY: "sk-ant" })).toEqual({
      mode: "ai",
      provider: "anthropic",
      modelId: DEFAULT_ANTHROPIC_MODEL,
    });
  });

  it("stays in demo mode when only BIKEDOC_MODEL is set", () => {
    expect(getModelConfig({ BIKEDOC_MODEL: "gpt-5" })).toEqual({ mode: "demo" });
  });

  it("uses OpenAI with the default model when only OPENAI_API_KEY is set", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "sk-test" })).toEqual({
      mode: "ai",
      provider: "openai",
      modelId: DEFAULT_OPENAI_MODEL,
    });
  });

  it("prefers OpenAI when both keys are set", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "sk-test", ANTHROPIC_API_KEY: "sk-ant" })).toEqual({
      mode: "ai",
      provider: "openai",
      modelId: DEFAULT_OPENAI_MODEL,
    });
  });

  it("uses Anthropic with the default model when only ANTHROPIC_API_KEY is set", () => {
    expect(getModelConfig({ ANTHROPIC_API_KEY: "sk-ant" })).toEqual({
      mode: "ai",
      provider: "anthropic",
      modelId: DEFAULT_ANTHROPIC_MODEL,
    });
  });

  it("applies BIKEDOC_MODEL override for OpenAI (trimmed)", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "sk-test", BIKEDOC_MODEL: "  gpt-4.1  " })).toEqual({
      mode: "ai",
      provider: "openai",
      modelId: "gpt-4.1",
    });
  });

  it("applies BIKEDOC_MODEL override for Anthropic", () => {
    expect(getModelConfig({ ANTHROPIC_API_KEY: "sk-ant", BIKEDOC_MODEL: "claude-haiku-4-5" })).toEqual({
      mode: "ai",
      provider: "anthropic",
      modelId: "claude-haiku-4-5",
    });
  });

  it("ignores a whitespace-only BIKEDOC_MODEL", () => {
    expect(getModelConfig({ OPENAI_API_KEY: "sk-test", BIKEDOC_MODEL: "   " })).toEqual({
      mode: "ai",
      provider: "openai",
      modelId: DEFAULT_OPENAI_MODEL,
    });
    expect(getModelConfig({ ANTHROPIC_API_KEY: "sk-ant", BIKEDOC_MODEL: "" })).toEqual({
      mode: "ai",
      provider: "anthropic",
      modelId: DEFAULT_ANTHROPIC_MODEL,
    });
  });
});
