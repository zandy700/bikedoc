import { z } from "zod";
import { createSeedState } from "@/lib/data/seed";
import { advanceBike } from "@/lib/store/lifecycle";
import {
  BIKE_TYPES,
  ISSUE_CATEGORIES,
  STAGES,
  type AppState,
  type Bike,
  type BikeType,
  type IssueCategory,
} from "@/lib/types";

export interface NewBikeInput {
  label: string;
  type: BikeType;
  size: string;
  color: string;
  notes?: string;
}

export function getBike(state: AppState, id: string): Bike | undefined {
  return state.bikes.find((b) => b.id === id);
}

export function bikesInShipment(state: AppState, shipmentId: string): Bike[] {
  return state.bikes.filter((b) => b.shipmentId === shipmentId);
}

function requireBike(state: AppState, id: string): Bike {
  const bike = getBike(state, id);
  if (!bike) throw new Error(`Bike "${id}" not found.`);
  return bike;
}

function replaceBike(state: AppState, next: Bike): AppState {
  return { ...state, bikes: state.bikes.map((b) => (b.id === next.id ? next : b)) };
}

function nextBikeId(state: AppState): string {
  const max = state.bikes.reduce((m, b) => {
    const n = /^BK-(\d+)$/.exec(b.id);
    return n ? Math.max(m, Number(n[1])) : m;
  }, 0);
  return `BK-${String(max + 1).padStart(4, "0")}`;
}

export function addBike(state: AppState, input: NewBikeInput, now: Date): { state: AppState; bike: Bike } {
  const label = input.label.trim();
  if (!label) throw new Error("Bike label is required.");
  if (!BIKE_TYPES.includes(input.type)) throw new Error(`Unknown bike type "${input.type}".`);
  const at = now.toISOString();
  const bike: Bike = {
    id: nextBikeId(state),
    label,
    type: input.type,
    size: input.size.trim(),
    color: input.color.trim(),
    intakeDate: at.slice(0, 10),
    stage: "intake",
    faults: [],
    notes: input.notes?.trim() ?? "",
    shipmentId: null,
    history: [{ at, stage: "intake", note: "Received donated bike at intake" }],
  };
  return { state: { ...state, bikes: [...state.bikes, bike] }, bike };
}

/** Advances a bike one stage. Throws if the bike is missing or the move is not allowed. */
export function advanceBikeInState(state: AppState, bikeId: string, now: Date, note?: string): AppState {
  return replaceBike(state, advanceBike(requireBike(state, bikeId), now, note));
}

/** Replaces the bike's faults (deduplicated, in ISSUE_CATEGORIES order). */
export function setBikeFaults(state: AppState, bikeId: string, faults: IssueCategory[]): AppState {
  const bike = requireBike(state, bikeId);
  for (const f of faults) {
    if (!ISSUE_CATEGORIES.includes(f)) throw new Error(`Unknown fault category "${f}".`);
  }
  const set = new Set(faults);
  return replaceBike(state, { ...bike, faults: ISSUE_CATEGORIES.filter((c) => set.has(c)) });
}

/** Assigns (or with null, unassigns) a shipment. Shipped bikes cannot change shipment. */
export function assignShipment(state: AppState, bikeId: string, shipmentId: string | null): AppState {
  const bike = requireBike(state, bikeId);
  if (shipmentId !== null && !state.shipments.some((s) => s.id === shipmentId)) {
    throw new Error(`Shipment "${shipmentId}" not found.`);
  }
  if (bike.stage === "shipped" && shipmentId !== bike.shipmentId) {
    throw new Error("A shipped bike cannot be moved to another shipment.");
  }
  return replaceBike(state, { ...bike, shipmentId });
}

/** Appends a history event at the bike's current stage. */
export function addBikeNote(state: AppState, bikeId: string, note: string, now: Date): AppState {
  const bike = requireBike(state, bikeId);
  const text = note.trim();
  if (!text) throw new Error("Note cannot be empty.");
  return replaceBike(state, {
    ...bike,
    history: [...bike.history, { at: now.toISOString(), stage: bike.stage, note: text }],
  });
}

// ---------------------------------------------------------------------------
// Persistence

export const STORAGE_KEY = "bikedoc:state:v1";

// Bound supported years so corrupted storage cannot produce enormous chart ranges.
const supportedYear = (value: string) => {
  const year = Number(value.slice(0, 4));
  return year >= 1900 && year <= 2199;
};
const storedDateSchema = z.iso.date().refine(supportedYear, "Date is outside the supported range");
const storedTimestampSchema = z.iso.datetime().refine(supportedYear, "Date is outside the supported range");

const historyEventSchema = z.object({
  at: storedTimestampSchema,
  stage: z.enum(STAGES),
  note: z.string(),
});

const bikeSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  type: z.enum(BIKE_TYPES),
  size: z.string(),
  color: z.string(),
  intakeDate: storedDateSchema,
  stage: z.enum(STAGES),
  faults: z.array(z.enum(ISSUE_CATEGORIES)),
  notes: z.string(),
  shipmentId: z.string().nullable(),
  history: z.array(historyEventSchema).min(1),
});

const shipmentSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  destination: z.string(),
  status: z.enum(["planning", "packing", "shipped"]),
  targetDate: storedDateSchema,
  capacity: z.number().int().nonnegative(),
});

const appStateSchema = z.object({
  bikes: z.array(bikeSchema),
  shipments: z.array(shipmentSchema),
});

/** Loads persisted state; falls back to the seed when missing, unreadable, or malformed. */
export function loadState(storage: Pick<Storage, "getItem"> | null): AppState {
  if (!storage) return createSeedState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw == null) return createSeedState();
    const parsed = appStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : createSeedState();
  } catch {
    return createSeedState();
  }
}

/** Persists state. Storage errors (quota, privacy mode) are swallowed. */
export function saveState(storage: Pick<Storage, "setItem"> | null, state: AppState): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearState(storage: Pick<Storage, "removeItem"> | null): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
