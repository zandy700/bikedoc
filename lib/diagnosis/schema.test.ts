/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { GUIDE_IDS, ISSUE_CATEGORIES } from "@/lib/types";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGE_DATA_URL_LENGTH,
  diagnoseRequestSchema,
  diagnosisSchema,
  issueSchema,
  type Issue,
} from "./schema";

const validIssue: Issue = {
  category: "brakes",
  title: "Worn brake pads",
  confidence: 0.8,
  evidence: "Squealing when braking and pads look thin.",
  guideId: "brake-pad-replacement",
};

const PNG = "data:image/png;base64,iVBORw0KGgo=";

function errorMessages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((i) => i.message) ?? [];
}

describe("issueSchema", () => {
  it("accepts a valid issue", () => {
    expect(issueSchema.safeParse(validIssue).success).toBe(true);
  });

  it.each([0, 0.5, 1])("accepts confidence %s", (confidence) => {
    expect(issueSchema.safeParse({ ...validIssue, confidence }).success).toBe(true);
  });

  it.each([-0.01, 1.01, 2, Number.NaN])("rejects confidence %s", (confidence) => {
    expect(issueSchema.safeParse({ ...validIssue, confidence }).success).toBe(false);
  });

  it.each([...ISSUE_CATEGORIES])("accepts category %s", (category) => {
    expect(issueSchema.safeParse({ ...validIssue, category }).success).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(issueSchema.safeParse({ ...validIssue, category: "suspension" }).success).toBe(false);
  });

  it.each([...GUIDE_IDS])("accepts guideId %s", (guideId) => {
    expect(issueSchema.safeParse({ ...validIssue, guideId }).success).toBe(true);
  });

  it("accepts null guideId", () => {
    expect(issueSchema.safeParse({ ...validIssue, guideId: null }).success).toBe(true);
  });

  it("rejects unknown or missing guideId", () => {
    expect(issueSchema.safeParse({ ...validIssue, guideId: "not-a-guide" }).success).toBe(false);
    const { guideId: _omit, ...withoutGuide } = validIssue;
    void _omit;
    expect(issueSchema.safeParse(withoutGuide).success).toBe(false);
  });

  it("enforces title length 1..120", () => {
    expect(issueSchema.safeParse({ ...validIssue, title: "" }).success).toBe(false);
    expect(issueSchema.safeParse({ ...validIssue, title: "x" }).success).toBe(true);
    expect(issueSchema.safeParse({ ...validIssue, title: "x".repeat(120) }).success).toBe(true);
    expect(issueSchema.safeParse({ ...validIssue, title: "x".repeat(121) }).success).toBe(false);
  });

  it("enforces evidence length 1..600", () => {
    expect(issueSchema.safeParse({ ...validIssue, evidence: "" }).success).toBe(false);
    expect(issueSchema.safeParse({ ...validIssue, evidence: "x".repeat(600) }).success).toBe(true);
    expect(issueSchema.safeParse({ ...validIssue, evidence: "x".repeat(601) }).success).toBe(false);
  });
});

describe("diagnosisSchema", () => {
  it("accepts an empty issue list", () => {
    expect(diagnosisSchema.safeParse({ summary: "Nothing found.", issues: [] }).success).toBe(true);
  });

  it("accepts up to 8 issues", () => {
    const issues = Array.from({ length: 8 }, () => validIssue);
    expect(diagnosisSchema.safeParse({ summary: "s", issues }).success).toBe(true);
  });

  it("rejects more than 8 issues", () => {
    const issues = Array.from({ length: 9 }, () => validIssue);
    expect(diagnosisSchema.safeParse({ summary: "s", issues }).success).toBe(false);
  });

  it("rejects an invalid nested issue", () => {
    const result = diagnosisSchema.safeParse({
      summary: "s",
      issues: [{ ...validIssue, confidence: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a summary over 600 characters", () => {
    expect(diagnosisSchema.safeParse({ summary: "x".repeat(601), issues: [] }).success).toBe(false);
  });
});

describe("diagnoseRequestSchema", () => {
  it("accepts description only", () => {
    const result = diagnoseRequestSchema.safeParse({ description: "Chain skips under load" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ description: "Chain skips under load" });
  });

  it("trims the description", () => {
    const result = diagnoseRequestSchema.parse({ description: "  squeaky brakes \n" });
    expect(result.description).toBe("squeaky brakes");
  });

  it.each([
    ["png", "data:image/png;base64,iVBORw0KGgo="],
    ["jpeg", "data:image/jpeg;base64,/9j/4AAQSkZJRg=="],
    ["webp", "data:image/webp;base64,UklGRiQAAABXRUJQ"],
  ])("accepts image only (%s) and defaults description to empty", (_mime, image) => {
    const result = diagnoseRequestSchema.safeParse({ image });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ description: "", image });
  });

  it("accepts both image and description", () => {
    expect(diagnoseRequestSchema.safeParse({ description: "wobbly wheel", image: PNG }).success).toBe(
      true,
    );
  });

  it("rejects neither with the expected message", () => {
    const result = diagnoseRequestSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(errorMessages(result)).toContain("Provide a photo, a description, or both.");
  });

  it("treats a whitespace-only description as empty", () => {
    const result = diagnoseRequestSchema.safeParse({ description: "   \n\t  " });
    expect(result.success).toBe(false);
    expect(errorMessages(result)).toContain("Provide a photo, a description, or both.");
  });

  it("accepts whitespace-only description when an image is present", () => {
    const result = diagnoseRequestSchema.safeParse({ description: "   ", image: PNG });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBe("");
  });

  it("rejects a GIF data URL", () => {
    const result = diagnoseRequestSchema.safeParse({ image: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" });
    expect(result.success).toBe(false);
    expect(errorMessages(result)).toContain("Image must be a PNG, JPEG or WebP data URL");
  });

  it.each([
    ["plain URL", "https://example.com/bike.png"],
    ["non-base64 data URL", "data:image/png,rawbytes"],
    ["invalid base64 chars", "data:image/png;base64,abc$%^"],
    ["empty payload", "data:image/png;base64,"],
  ])("rejects malformed image (%s)", (_name, image) => {
    expect(diagnoseRequestSchema.safeParse({ description: "x", image }).success).toBe(false);
  });

  it("rejects an oversized image", () => {
    const prefix = "data:image/png;base64,";
    const image = prefix + "A".repeat(MAX_IMAGE_DATA_URL_LENGTH - prefix.length + 1);
    const result = diagnoseRequestSchema.safeParse({ image });
    expect(result.success).toBe(false);
    expect(errorMessages(result)).toContain("Image is too large");
  });

  it("accepts an image exactly at the size limit", () => {
    const prefix = "data:image/png;base64,";
    const image = prefix + "A".repeat(MAX_IMAGE_DATA_URL_LENGTH - prefix.length);
    expect(diagnoseRequestSchema.safeParse({ image }).success).toBe(true);
  });

  it("rejects a description that is too long", () => {
    const result = diagnoseRequestSchema.safeParse({ description: "x".repeat(MAX_DESCRIPTION_LENGTH + 1) });
    expect(result.success).toBe(false);
  });

  it("accepts a description at the max length", () => {
    expect(
      diagnoseRequestSchema.safeParse({ description: "x".repeat(MAX_DESCRIPTION_LENGTH) }).success,
    ).toBe(true);
  });

  it("rejects non-string fields", () => {
    expect(diagnoseRequestSchema.safeParse({ description: 42 }).success).toBe(false);
    expect(diagnoseRequestSchema.safeParse({ image: 42 }).success).toBe(false);
    expect(diagnoseRequestSchema.safeParse(null).success).toBe(false);
  });
});
