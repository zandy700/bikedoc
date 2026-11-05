/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateObjectMock } = vi.hoisted(() => ({ generateObjectMock: vi.fn() }));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return { ...actual, generateObject: generateObjectMock };
});

import { FALLBACK_NOTICE, runDiagnosis, SYSTEM_PROMPT } from "./diagnose";
import { GET, POST } from "@/app/api/diagnose/route";
import { GUIDE_IDS } from "@/lib/types";

const IMAGE = "data:image/png;base64,iVBORw0KGgo=";
const AI_ENV = { OPENAI_API_KEY: "sk-test" };

beforeEach(() => {
  generateObjectMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("runDiagnosis", () => {
  it("returns 400 for an invalid body", async () => {
    for (const body of [null, "nope", {}, { description: "" }, { description: 42 }, { image: "data:text/plain;base64,AA==" }]) {
      const res = await runDiagnosis(body, {});
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    }
  });

  it("uses demo mode with no API keys", async () => {
    const res = await runDiagnosis({ description: "Gears skipping" }, {});
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, mode: "demo" });
    if (res.body.ok) {
      expect(res.body.model).toBeUndefined();
      expect(res.body.diagnosis.issues[0].guideId).toBe("index-rear-derailleur");
    }
    expect(generateObjectMock).not.toHaveBeenCalled();
  });

  it("calls the AI with text and image parts and returns mode ai", async () => {
    generateObjectMock.mockResolvedValue({
      object: {
        summary: "Likely worn chain.",
        issues: [
          { category: "brakes", title: "Pads", confidence: 0.3, evidence: "Visible wear", guideId: "brake-pad-replacement" },
          { category: "chain", title: "Worn chain", confidence: 0.8, evidence: "Skips under load", guideId: "chain-wear-check" },
        ],
      },
    });
    const res = await runDiagnosis({ description: "chain skips", image: IMAGE }, AI_ENV);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, mode: "ai", model: "openai:gpt-4o-mini" });
    if (res.body.ok) expect(res.body.diagnosis.issues.map((i) => i.confidence)).toEqual([0.8, 0.3]);

    const args = generateObjectMock.mock.calls[0][0];
    expect(args.instructions).toBe(SYSTEM_PROMPT);
    expect(args.schema).toBeDefined();
    const content = args.messages[0].content;
    expect(content[0]).toMatchObject({ type: "text" });
    expect(content[0].text).toContain("chain skips");
    expect(content[1]).toEqual({ type: "file", mediaType: "image/png", data: { type: "data", data: "iVBORw0KGgo=" } });
  });

  it("falls back to rules with a notice when the AI call throws", async () => {
    generateObjectMock.mockRejectedValue(new Error("rate limited"));
    const res = await runDiagnosis({ description: "flat tyre" }, AI_ENV);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, mode: "demo", notice: FALLBACK_NOTICE });
    if (res.body.ok) expect(res.body.diagnosis.issues[0].guideId).toBe("flat-tire-repair");
  });

  it("falls back when the AI returns output that fails the schema", async () => {
    generateObjectMock.mockResolvedValue({
      object: { summary: "x", issues: [{ category: "brakes", title: "t", confidence: 2, evidence: "e", guideId: "made-up" }] },
    });
    const res = await runDiagnosis({ description: "squeal" }, { ANTHROPIC_API_KEY: "k" });
    expect(res.body).toMatchObject({ ok: true, mode: "demo", notice: FALLBACK_NOTICE });
  });

  it("system prompt lists every allowed guide id", () => {
    for (const id of GUIDE_IDS) expect(SYSTEM_PROMPT).toContain(id);
  });
});

describe("/api/diagnose route", () => {
  it("POST returns 400 for non-JSON bodies", async () => {
    const res = await POST(new Request("http://x/api/diagnose", { method: "POST", body: "not json" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false });
  });

  it("POST returns a diagnosis", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const res = await POST(
      new Request("http://x/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: "creaks when pedalling" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, mode: "demo" });
    vi.unstubAllEnvs();
  });

  it("GET reports the mode", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await (await GET()).json()).toEqual({ mode: "demo" });
    vi.stubEnv("ANTHROPIC_API_KEY", "k");
    vi.stubEnv("BIKEDOC_MODEL", "");
    expect(await (await GET()).json()).toEqual({ mode: "ai", model: "anthropic:claude-sonnet-5-5" });
    vi.unstubAllEnvs();
  });
});
