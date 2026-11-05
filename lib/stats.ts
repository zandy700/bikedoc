import { stageIndex } from "@/lib/store/lifecycle";
import {
  CATEGORY_LABELS,
  ISSUE_CATEGORIES,
  STAGES,
  STAGE_LABELS,
  type AppState,
  type IssueCategory,
  type Stage,
} from "@/lib/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "YYYY-MM" (UTC) for an ISO date or timestamp. */
const monthKey = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso).toISOString().slice(0, 7);

/**
 * Per-month intake and repaired counts (repaired = bike first reached QA that month),
 * covering every month from the earliest to the latest relevant event, zero-filled.
 */
export function repairedOverTime(
  state: AppState,
): { month: string; label: string; repaired: number; intake: number }[] {
  const intake = new Map<string, number>();
  const repaired = new Map<string, number>();
  for (const bike of state.bikes) {
    const k = monthKey(bike.intakeDate);
    intake.set(k, (intake.get(k) ?? 0) + 1);
    const qa = bike.history.find((e) => e.stage === "qa");
    if (qa) {
      const q = monthKey(qa.at);
      repaired.set(q, (repaired.get(q) ?? 0) + 1);
    }
  }
  const keys = [...intake.keys(), ...repaired.keys()].sort();
  if (keys.length === 0) return [];

  const out: { month: string; label: string; repaired: number; intake: number }[] = [];
  let [y, m] = keys[0].split("-").map(Number);
  const last = keys[keys.length - 1];
  for (;;) {
    const month = `${y}-${String(m).padStart(2, "0")}`;
    out.push({ month, label: MONTH_LABELS[m - 1], repaired: repaired.get(month) ?? 0, intake: intake.get(month) ?? 0 });
    if (month >= last) break;
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

/** Fault counts for every category, sorted by count desc (ties in ISSUE_CATEGORIES order). */
export function faultsByCategory(state: AppState): { category: IssueCategory; label: string; count: number }[] {
  const counts = new Map<IssueCategory, number>(ISSUE_CATEGORIES.map((c) => [c, 0]));
  for (const bike of state.bikes) {
    for (const f of new Set(bike.faults)) counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return ISSUE_CATEGORIES.map((category) => ({ category, label: CATEGORY_LABELS[category], count: counts.get(category) ?? 0 }))
    .map((row, i) => ({ row, i }))
    .sort((a, b) => b.row.count - a.row.count || a.i - b.i)
    .map(({ row }) => row);
}

export function shipmentProgress(
  state: AppState,
): { shipmentId: string; name: string; assigned: number; shipped: number; capacity: number }[] {
  return state.shipments.map((s) => {
    const bikes = state.bikes.filter((b) => b.shipmentId === s.id);
    return {
      shipmentId: s.id,
      name: s.name,
      assigned: bikes.length,
      shipped: bikes.filter((b) => b.stage === "shipped").length,
      capacity: s.capacity,
    };
  });
}

/** For each stage, how many bikes are at or past it. */
export function stageFunnel(state: AppState): { stage: Stage; label: string; count: number }[] {
  return STAGES.map((stage) => {
    const idx = stageIndex(stage);
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: state.bikes.filter((b) => stageIndex(b.stage) >= idx).length,
    };
  });
}

export function summaryStats(state: AppState): {
  total: number;
  inProgress: number;
  readyToShip: number;
  shipped: number;
} {
  const count = (pred: (s: Stage) => boolean) => state.bikes.filter((b) => pred(b.stage)).length;
  return {
    total: state.bikes.length,
    inProgress: count((s) => s === "intake" || s === "diagnosis" || s === "repair"),
    readyToShip: count((s) => s === "qa"),
    shipped: count((s) => s === "shipped"),
  };
}
