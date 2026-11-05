import { describe, expect, it } from "vitest";
import { GUIDE_IDS, ISSUE_CATEGORIES } from "@/lib/types";
import { RULES } from "@/lib/diagnosis/rules";
import { GUIDES, getGuide, guidesByCategory } from "./index";

describe("guides", () => {
  it("has exactly one guide per GUIDE_ID", () => {
    expect(GUIDES).toHaveLength(GUIDE_IDS.length);
    for (const id of GUIDE_IDS) {
      expect(GUIDES.filter((g) => g.id === id)).toHaveLength(1);
    }
  });

  it.each(GUIDES.map((g) => [g.id, g] as const))("%s has complete content", (_id, g) => {
    expect(g.title.trim()).not.toBe("");
    expect(g.summary.trim()).not.toBe("");
    expect(ISSUE_CATEGORIES).toContain(g.category);
    expect(["easy", "medium", "hard"]).toContain(g.difficulty);
    expect(g.timeMinutes).toBeGreaterThan(0);
    expect(g.tools.length).toBeGreaterThan(0);
    expect(g.safetyNotes.length).toBeGreaterThan(0);
    expect(g.steps.length).toBeGreaterThanOrEqual(5);
    expect(g.steps.length).toBeLessThanOrEqual(9);
    expect(g.verify.length).toBeGreaterThan(0);
    for (const s of g.steps) {
      expect(s.title.trim()).not.toBe("");
      expect(s.body.trim()).not.toBe("");
      if (s.caution !== undefined) expect(s.caution.trim()).not.toBe("");
    }
    for (const list of [g.tools, g.parts, g.safetyNotes, g.verify]) {
      for (const item of list) expect(item.trim()).not.toBe("");
    }
  });

  it("brake guides require a second-mechanic check", () => {
    for (const g of guidesByCategory("brakes")) {
      expect(g.safetyNotes.join(" ")).toMatch(/second mechanic/i);
    }
  });

  it("getGuide finds guides and returns undefined for unknown ids", () => {
    expect(getGuide("wheel-truing")?.category).toBe("wheels");
    expect(getGuide("nope")).toBeUndefined();
  });

  it("guidesByCategory filters by category and covers every guide", () => {
    const total = ISSUE_CATEGORIES.reduce((n, c) => n + guidesByCategory(c).length, 0);
    expect(total).toBe(GUIDES.length);
    expect(guidesByCategory("chain").map((g) => g.id).sort()).toEqual(["chain-replacement", "chain-wear-check"]);
  });

  it("every rule guideId exists and rule category matches the guide category", () => {
    for (const rule of RULES) {
      if (rule.guideId === null) continue;
      const guide = getGuide(rule.guideId);
      expect(guide, rule.guideId).toBeDefined();
      expect(guide!.category).toBe(rule.category);
    }
  });
});
