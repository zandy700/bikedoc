import { STAGES, STAGE_LABELS, type Bike, type Stage } from "@/lib/types";

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

/** Next stage in the pipeline, or null if the bike is already shipped. */
export function nextStage(stage: Stage): Stage | null {
  const i = stageIndex(stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
}

export function previousStage(stage: Stage): Stage | null {
  const i = stageIndex(stage);
  return i > 0 ? STAGES[i - 1] : null;
}

export type AdvanceCheck = { ok: true; to: Stage } | { ok: false; reason: string };

/**
 * Business rules for moving a bike forward one stage:
 * - shipped is terminal
 * - moving to shipped requires an assigned shipment
 */
export function canAdvance(bike: Bike): AdvanceCheck {
  const to = nextStage(bike.stage);
  if (!to) return { ok: false, reason: "Bike has already shipped." };
  if (to === "shipped" && !bike.shipmentId) {
    return { ok: false, reason: "Assign the bike to a shipment before marking it shipped." };
  }
  return { ok: true, to };
}

/** Returns a new Bike advanced one stage, with a history event. Throws if not allowed. */
export function advanceBike(bike: Bike, now: Date, note?: string): Bike {
  const check = canAdvance(bike);
  if (!check.ok) throw new Error(check.reason);
  const text = note?.trim() ? `Moved to ${STAGE_LABELS[check.to]} — ${note.trim()}` : `Moved to ${STAGE_LABELS[check.to]}`;
  return {
    ...bike,
    stage: check.to,
    history: [...bike.history, { at: now.toISOString(), stage: check.to, note: text }],
  };
}
