import { describe, expect, it } from "vitest";
import { advanceBike, canAdvance, nextStage, previousStage, stageIndex } from "@/lib/store/lifecycle";
import type { Bike } from "@/lib/types";

const bike = (over: Partial<Bike> = {}): Bike => ({
  id: "BK-0001",
  label: "Steel hybrid, 7-speed",
  type: "hybrid",
  size: "M",
  color: "Black",
  intakeDate: "2026-10-01",
  stage: "intake",
  faults: [],
  notes: "",
  shipmentId: null,
  history: [{ at: "2026-10-01T10:00:00.000Z", stage: "intake", note: "Received" }],
  ...over,
});

describe("lifecycle", () => {
  it("nextStage / previousStage / stageIndex", () => {
    expect(nextStage("intake")).toBe("diagnosis");
    expect(nextStage("qa")).toBe("shipped");
    expect(nextStage("shipped")).toBeNull();
    expect(previousStage("intake")).toBeNull();
    expect(previousStage("shipped")).toBe("qa");
    expect(stageIndex("repair")).toBe(2);
  });

  it("canAdvance blocks shipped and qa without shipment", () => {
    expect(canAdvance(bike())).toEqual({ ok: true, to: "diagnosis" });
    expect(canAdvance(bike({ stage: "shipped", shipmentId: "S" }))).toMatchObject({ ok: false });
    const noShip = canAdvance(bike({ stage: "qa" }));
    expect(noShip.ok).toBe(false);
    if (!noShip.ok) expect(noShip.reason).toMatch(/shipment/i);
    expect(canAdvance(bike({ stage: "qa", shipmentId: "S" }))).toEqual({ ok: true, to: "shipped" });
  });

  it("advanceBike returns a new bike with a history event", () => {
    const b = bike();
    const now = new Date("2026-10-02T12:00:00Z");
    const next = advanceBike(b, now, "  checked  ");
    expect(next).not.toBe(b);
    expect(b.stage).toBe("intake");
    expect(b.history).toHaveLength(1);
    expect(next.stage).toBe("diagnosis");
    expect(next.history.at(-1)).toEqual({ at: now.toISOString(), stage: "diagnosis", note: "Moved to Diagnosis — checked" });
    expect(advanceBike(b, now).history.at(-1)!.note).toBe("Moved to Diagnosis");
  });

  it("advanceBike throws when not allowed", () => {
    expect(() => advanceBike(bike({ stage: "shipped", shipmentId: "S" }), new Date())).toThrow(/already shipped/);
    expect(() => advanceBike(bike({ stage: "qa" }), new Date())).toThrow(/shipment/);
  });
});
