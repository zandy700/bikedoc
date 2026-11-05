import { describe, expect, it } from "vitest";
import { faultsByCategory, repairedOverTime, shipmentProgress, stageFunnel, summaryStats } from "@/lib/stats";
import type { AppState, Bike, HistoryEvent, Stage } from "@/lib/types";
import { STAGES } from "@/lib/types";

function bike(id: string, stage: Stage, intakeDate: string, extra: Partial<Bike> = {}, qaAt?: string): Bike {
  const history: HistoryEvent[] = STAGES.slice(0, STAGES.indexOf(stage) + 1).map((s, i) => ({
    at: s === "qa" && qaAt ? qaAt : `${intakeDate}T1${i}:00:00.000Z`,
    stage: s,
    note: s,
  }));
  return {
    id, label: "x", type: "hybrid", size: "M", color: "Red", intakeDate, stage,
    faults: [], notes: "", shipmentId: null, history, ...extra,
  };
}

const state: AppState = {
  shipments: [
    { id: "A", name: "A — SAMPLE", destination: "d", status: "shipped", targetDate: "2026-04-01", capacity: 10 },
    { id: "B", name: "B — SAMPLE", destination: "d", status: "planning", targetDate: "2026-06-01", capacity: 5 },
  ],
  bikes: [
    bike("BK-0001", "shipped", "2026-01-10", { faults: ["chain", "brakes"], shipmentId: "A" }, "2026-03-02T10:00:00.000Z"),
    bike("BK-0002", "qa", "2026-01-20", { faults: ["chain"], shipmentId: "A" }, "2026-01-30T10:00:00.000Z"),
    bike("BK-0003", "repair", "2026-03-05", { faults: ["gearing", "chain"], shipmentId: "B" }),
    bike("BK-0004", "intake", "2026-03-20"),
  ],
};

describe("stats", () => {
  it("repairedOverTime zero-fills months between first and last event", () => {
    expect(repairedOverTime(state)).toEqual([
      { month: "2026-01", label: "Jan", repaired: 1, intake: 2 },
      { month: "2026-02", label: "Feb", repaired: 0, intake: 0 },
      { month: "2026-03", label: "Mar", repaired: 1, intake: 2 },
    ]);
    expect(repairedOverTime({ bikes: [], shipments: [] })).toEqual([]);
  });

  it("repairedOverTime crosses year boundaries", () => {
    const s: AppState = { shipments: [], bikes: [bike("BK-1", "intake", "2025-12-15"), bike("BK-2", "intake", "2026-01-15")] };
    expect(repairedOverTime(s).map((r) => r.month)).toEqual(["2025-12", "2026-01"]);
  });

  it("faultsByCategory counts all categories, sorted desc", () => {
    const rows = faultsByCategory(state);
    expect(rows).toHaveLength(6);
    expect(rows.slice(0, 3)).toEqual([
      { category: "chain", label: "Chain", count: 3 },
      { category: "gearing", label: "Gearing", count: 1 },
      { category: "brakes", label: "Brakes", count: 1 },
    ]);
    expect(rows.slice(3).every((r) => r.count === 0)).toBe(true);
  });

  it("shipmentProgress", () => {
    expect(shipmentProgress(state)).toEqual([
      { shipmentId: "A", name: "A — SAMPLE", assigned: 2, shipped: 1, capacity: 10 },
      { shipmentId: "B", name: "B — SAMPLE", assigned: 1, shipped: 0, capacity: 5 },
    ]);
  });

  it("stageFunnel counts bikes at or past each stage", () => {
    expect(stageFunnel(state).map((r) => [r.stage, r.label, r.count])).toEqual([
      ["intake", "Intake", 4],
      ["diagnosis", "Diagnosis", 3],
      ["repair", "Repair", 3],
      ["qa", "QA", 2],
      ["shipped", "Shipped", 1],
    ]);
  });

  it("summaryStats", () => {
    expect(summaryStats(state)).toEqual({ total: 4, inProgress: 2, readyToShip: 1, shipped: 1 });
  });
});
