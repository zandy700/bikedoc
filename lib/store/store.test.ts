import { beforeEach, describe, expect, it } from "vitest";
import { createSeedState } from "@/lib/data/seed";
import {
  addBike,
  addBikeNote,
  advanceBikeInState,
  assignShipment,
  bikesInShipment,
  clearState,
  getBike,
  loadState,
  saveState,
  setBikeFaults,
  STORAGE_KEY,
} from "@/lib/store/store";
import type { AppState } from "@/lib/types";

const now = new Date("2026-11-01T09:30:00Z");

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

function deepFreeze<T>(o: T): T {
  if (o && typeof o === "object") {
    Object.values(o).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
}

let state: AppState;
beforeEach(() => {
  state = deepFreeze(createSeedState());
});

const firstAt = (stage: string) => state.bikes.find((b) => b.stage === stage)!;

describe("store reducers", () => {
  it("addBike appends an intake bike with the next id", () => {
    const { state: next, bike } = addBike(state, { label: " Steel hybrid ", type: "hybrid", size: "M", color: "Red", notes: "Flat rear" }, now);
    expect(bike.id).toBe(`BK-${String(state.bikes.length + 1).padStart(4, "0")}`);
    expect(bike).toMatchObject({ label: "Steel hybrid", stage: "intake", faults: [], shipmentId: null, notes: "Flat rear", intakeDate: "2026-11-01" });
    expect(bike.history).toEqual([{ at: now.toISOString(), stage: "intake", note: expect.any(String) }]);
    expect(next.bikes).toHaveLength(state.bikes.length + 1);
    expect(next.bikes.at(-1)).toBe(bike);
    expect(addBike({ bikes: [], shipments: [] }, { label: "x", type: "kids", size: "", color: "" }, now).bike.id).toBe("BK-0001");
  });

  it("addBike rejects empty labels", () => {
    expect(() => addBike(state, { label: "  ", type: "road", size: "", color: "" }, now)).toThrow(/label/);
  });

  it("advanceBikeInState advances immutably", () => {
    const b = firstAt("intake");
    const next = advanceBikeInState(state, b.id, now, "ok");
    expect(getBike(next, b.id)!.stage).toBe("diagnosis");
    expect(getBike(next, b.id)!.history.at(-1)!.note).toContain("ok");
    expect(getBike(state, b.id)!.stage).toBe("intake");
    const other = state.bikes.find((x) => x.id !== b.id)!;
    expect(getBike(next, other.id)).toBe(other);
  });

  it("advanceBikeInState throws for missing bike, shipped bike, and qa without shipment", () => {
    expect(() => advanceBikeInState(state, "BK-9999", now)).toThrow(/BK-9999.*not found/);
    expect(() => advanceBikeInState(state, firstAt("shipped").id, now)).toThrow(/shipped/);
    const qa = firstAt("qa");
    const unassigned = assignShipment(state, qa.id, null);
    expect(() => advanceBikeInState(unassigned, qa.id, now)).toThrow(/shipment/);
  });

  it("setBikeFaults dedupes and orders", () => {
    const b = firstAt("intake");
    const next = setBikeFaults(state, b.id, ["chain", "brakes", "chain"]);
    expect(getBike(next, b.id)!.faults).toEqual(["brakes", "chain"]);
    expect(b.faults).toEqual([]);
    expect(() => setBikeFaults(state, "nope", [])).toThrow(/not found/);
  });

  it("assignShipment validates shipment and shipped bikes", () => {
    const b = firstAt("repair");
    const next = assignShipment(state, b.id, "SH-LOC-1");
    expect(getBike(next, b.id)!.shipmentId).toBe("SH-LOC-1");
    expect(getBike(assignShipment(next, b.id, null), b.id)!.shipmentId).toBeNull();
    expect(() => assignShipment(state, b.id, "SH-NOPE")).toThrow(/Shipment "SH-NOPE" not found/);
    expect(() => assignShipment(state, firstAt("shipped").id, null)).toThrow(/shipped/);
    expect(() => assignShipment(state, "nope", null)).toThrow(/not found/);
  });

  it("addBikeNote appends an event at the current stage", () => {
    const b = firstAt("repair");
    const next = addBikeNote(state, b.id, "  Replaced chain ", now);
    expect(getBike(next, b.id)!.history.at(-1)).toEqual({ at: now.toISOString(), stage: "repair", note: "Replaced chain" });
    expect(getBike(state, b.id)!.history).toHaveLength(b.history.length);
    expect(() => addBikeNote(state, b.id, "   ", now)).toThrow(/empty/);
  });

  it("bikesInShipment", () => {
    const list = bikesInShipment(state, "SH-ZNZ-1");
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((b) => b.shipmentId === "SH-ZNZ-1")).toBe(true);
    expect(bikesInShipment(state, "missing")).toEqual([]);
  });
});

describe("persistence", () => {
  const seed = createSeedState();

  it("falls back to seed on null storage, missing, corrupt JSON or bad shape", () => {
    expect(loadState(null)).toEqual(seed);
    expect(loadState(fakeStorage())).toEqual(seed);
    expect(loadState(fakeStorage({ [STORAGE_KEY]: "{not json" }))).toEqual(seed);
    expect(loadState(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ bikes: "x" }) }))).toEqual(seed);
    const bad = { ...seed, bikes: [{ ...seed.bikes[0], stage: "lost" }] };
    expect(loadState(fakeStorage({ [STORAGE_KEY]: JSON.stringify(bad) }))).toEqual(seed);
    const noHistory = { ...seed, bikes: [{ ...seed.bikes[0], history: [] }] };
    expect(loadState(fakeStorage({ [STORAGE_KEY]: JSON.stringify(noHistory) }))).toEqual(seed);
    const throwing = { getItem: () => { throw new Error("denied"); } };
    expect(loadState(throwing)).toEqual(seed);
  });

  it("round-trips through save/load and clears", () => {
    const storage = fakeStorage();
    const { state: modified } = addBike(seed, { label: "Kids 20in single-speed", type: "kids", size: "20in wheel", color: "Blue" }, now);
    saveState(storage, modified);
    expect(storage.data.has(STORAGE_KEY)).toBe(true);
    expect(loadState(storage)).toEqual(modified);
    clearState(storage);
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(loadState(storage)).toEqual(seed);
  });

  it("save/clear swallow storage errors and accept null", () => {
    const boom = () => { throw new Error("quota"); };
    expect(() => saveState({ setItem: boom }, seed)).not.toThrow();
    expect(() => clearState({ removeItem: boom })).not.toThrow();
    expect(() => saveState(null, seed)).not.toThrow();
    expect(() => clearState(null)).not.toThrow();
  });
});
