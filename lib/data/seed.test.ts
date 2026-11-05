import { describe, expect, it } from "vitest";
import { createSeedState, SEED_REFERENCE_DATE } from "@/lib/data/seed";
import { BIKE_TYPES, STAGES } from "@/lib/types";

describe("createSeedState", () => {
  const state = createSeedState();
  const ref = Date.parse(`${SEED_REFERENCE_DATE}T00:00:00Z`);

  it("is deterministic and returns fresh objects", () => {
    const again = createSeedState();
    expect(again).toEqual(state);
    expect(again).not.toBe(state);
    expect(again.bikes[0]).not.toBe(state.bikes[0]);
    expect(again.shipments[0]).not.toBe(state.shipments[0]);
  });

  it("has ~60 bikes covering every stage and type", () => {
    expect(state.bikes.length).toBeGreaterThanOrEqual(55);
    expect(state.bikes.length).toBeLessThanOrEqual(65);
    for (const s of STAGES) expect(state.bikes.some((b) => b.stage === s)).toBe(true);
    for (const t of BIKE_TYPES) expect(state.bikes.some((b) => b.type === t)).toBe(true);
    const shipped = state.bikes.filter((b) => b.stage === "shipped").length;
    expect(shipped).toBeGreaterThan(state.bikes.length / 3);
  });

  it("has 3 sample shipments including the Zanzibar container", () => {
    expect(state.shipments).toHaveLength(3);
    for (const s of state.shipments) expect(s.name.endsWith("— SAMPLE")).toBe(true);
    const znz = state.shipments.find((s) => s.name === "Zanzibar container — SAMPLE");
    expect(znz?.status).toBe("shipped");
    expect(new Set(state.shipments.map((s) => s.id)).size).toBe(3);
  });

  it("has unique BK-NNNN ids", () => {
    const ids = state.bikes.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^BK-\d{4}$/);
  });

  it("keeps histories consistent with stage and before the reference date", () => {
    for (const b of state.bikes) {
      expect(b.history[0].stage).toBe("intake");
      expect(b.history[0].at.slice(0, 10)).toBe(b.intakeDate);
      expect(b.history.at(-1)!.stage).toBe(b.stage);
      expect(b.history.map((e) => e.stage)).toEqual(STAGES.slice(0, STAGES.indexOf(b.stage) + 1));
      const times = b.history.map((e) => Date.parse(e.at));
      for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]);
      expect(times.at(-1)!).toBeLessThan(ref);
    }
  });

  it("spreads intake over ~10 months", () => {
    const dates = state.bikes.map((b) => Date.parse(b.intakeDate)).sort((a, b) => a - b);
    const months = (dates.at(-1)! - dates[0]) / (30 * 24 * 3600 * 1000);
    expect(months).toBeGreaterThan(8);
    expect(months).toBeLessThan(11);
  });

  it("assigns shipments consistently", () => {
    const byId = new Map(state.shipments.map((s) => [s.id, s]));
    for (const b of state.bikes) {
      if (b.stage === "shipped") {
        expect(b.shipmentId).not.toBeNull();
        expect(["shipped", "packing"]).toContain(byId.get(b.shipmentId!)?.status);
      } else if (b.shipmentId) {
        expect(byId.get(b.shipmentId)?.status).not.toBe("shipped");
      }
      if (b.shipmentId) expect(byId.has(b.shipmentId)).toBe(true);
    }
  });

  it("records faults for bikes past diagnosis", () => {
    for (const b of state.bikes) {
      if (STAGES.indexOf(b.stage) > STAGES.indexOf("diagnosis")) expect(b.faults.length).toBeGreaterThan(0);
      if (b.stage === "intake") expect(b.faults).toEqual([]);
    }
  });
});
