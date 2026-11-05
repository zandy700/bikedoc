/** Shared domain types for BikeDoc. */

export const ISSUE_CATEGORIES = [
  "gearing",
  "brakes",
  "frame",
  "wheels",
  "chain",
  "other",
] as const;
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const STAGES = ["intake", "diagnosis", "repair", "qa", "shipped"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  intake: "Intake",
  diagnosis: "Diagnosis",
  repair: "Repair",
  qa: "QA",
  shipped: "Shipped",
};

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  gearing: "Gearing",
  brakes: "Brakes",
  frame: "Frame",
  wheels: "Wheels",
  chain: "Chain",
  other: "Other",
};

export const BIKE_TYPES = ["road", "mountain", "hybrid", "city", "kids"] as const;
export type BikeType = (typeof BIKE_TYPES)[number];

export interface HistoryEvent {
  /** ISO 8601 timestamp */
  at: string;
  /** Stage the bike was in after this event */
  stage: Stage;
  /** Human-readable note, e.g. "Moved to Repair" or a mechanic's comment */
  note: string;
}

export interface Bike {
  /** Stable id, e.g. "BK-0001" */
  id: string;
  /** Make/model style label, e.g. "Steel hybrid, 7-speed" */
  label: string;
  type: BikeType;
  /** e.g. "M", "54cm", "24in wheel" */
  size: string;
  color: string;
  /** ISO date the bike arrived */
  intakeDate: string;
  stage: Stage;
  /** Fault categories found during diagnosis (may be empty before diagnosis) */
  faults: IssueCategory[];
  notes: string;
  shipmentId: string | null;
  /** Chronological, oldest first. First entry is always the intake event. */
  history: HistoryEvent[];
}

export type ShipmentStatus = "planning" | "packing" | "shipped";

export interface Shipment {
  /** e.g. "SH-ZNZ-1" */
  id: string;
  /** e.g. "Zanzibar container — SAMPLE" */
  name: string;
  destination: string;
  status: ShipmentStatus;
  /** ISO date */
  targetDate: string;
  /** Number of bikes the batch is planned to hold */
  capacity: number;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface GuideStep {
  title: string;
  body: string;
  /** Optional caution specific to this step */
  caution?: string;
}

export interface Guide {
  id: GuideId;
  title: string;
  category: IssueCategory;
  summary: string;
  difficulty: Difficulty;
  /** Minutes, typical for a volunteer with the right tools */
  timeMinutes: number;
  tools: string[];
  /** Parts/consumables that may be needed */
  parts: string[];
  safetyNotes: string[];
  steps: GuideStep[];
  /** How to confirm the repair worked */
  verify: string[];
}

export const GUIDE_IDS = [
  "index-rear-derailleur",
  "chain-wear-check",
  "chain-replacement",
  "brake-pad-replacement",
  "brake-cable-tension",
  "rim-brake-toe-in",
  "disc-rotor-rub",
  "wheel-truing",
  "flat-tire-repair",
  "hub-bearing-check",
  "bottom-bracket-check",
  "headset-adjustment",
  "frame-crack-inspection",
] as const;
export type GuideId = (typeof GUIDE_IDS)[number];

export interface AppState {
  bikes: Bike[];
  shipments: Shipment[];
}
