import {
  ISSUE_CATEGORIES,
  STAGES,
  STAGE_LABELS,
  type AppState,
  type Bike,
  type BikeType,
  type HistoryEvent,
  type IssueCategory,
  type Shipment,
  type Stage,
} from "@/lib/types";

/** All seeded timestamps fall before this date. */
export const SEED_REFERENCE_DATE = "2026-10-31";

const SEED = 0x5eed_b1ce;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Small deterministic PRNG (mulberry32). Returns floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];

function shuffle<T>(rng: Rng, items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

export const SEED_SHIPMENTS: Shipment[] = [
  {
    id: "SH-ZNZ-1",
    name: "Zanzibar container — SAMPLE",
    destination: "Zanzibar, Tanzania",
    status: "shipped",
    targetDate: "2026-08-14",
    capacity: 32,
  },
  {
    id: "SH-ZNZ-2",
    name: "Zanzibar container #2 — SAMPLE",
    destination: "Zanzibar, Tanzania",
    status: "packing",
    targetDate: "2026-12-12",
    capacity: 40,
  },
  {
    id: "SH-LOC-1",
    name: "Local community bikes — SAMPLE",
    destination: "Local community partners",
    status: "planning",
    targetDate: "2027-02-06",
    capacity: 15,
  },
];

/** Time the first container left; every shipped bike carries this ship event. */
const ZNZ1_SHIP_AT = Date.parse("2026-08-14T10:00:00Z");

interface Template {
  label: string;
  sizes: readonly string[];
}

const TEMPLATES: Record<BikeType, readonly Template[]> = {
  road: [
    { label: "Steel road bike, 10-speed, drop bars", sizes: ["52cm", "54cm", "56cm", "58cm"] },
    { label: "Aluminium road bike, 16-speed", sizes: ["50cm", "54cm", "56cm"] },
    { label: "Vintage steel tourer, 12-speed", sizes: ["54cm", "57cm", "60cm"] },
  ],
  mountain: [
    { label: "Aluminium MTB, 21-speed, front suspension", sizes: ["S", "M", "L", "17in frame"] },
    { label: "Steel rigid MTB, 18-speed", sizes: ["M", "L", "19in frame"] },
    { label: "Aluminium MTB, 24-speed, disc brakes", sizes: ["S", "M", "L"] },
  ],
  hybrid: [
    { label: "Steel hybrid, 7-speed", sizes: ["S", "M", "L"] },
    { label: "Aluminium hybrid, 21-speed", sizes: ["M", "L", "XL"] },
    { label: "Aluminium hybrid, 24-speed, disc brakes", sizes: ["S", "M", "L"] },
  ],
  city: [
    { label: "Step-through city bike, 3-speed hub", sizes: ["S", "M"] },
    { label: "Steel city bike, single-speed, coaster brake", sizes: ["M", "L"] },
    { label: "Step-through city bike, 7-speed, dynamo lights", sizes: ["S", "M", "L"] },
  ],
  kids: [
    { label: "Kids 20in single-speed", sizes: ["20in wheel"] },
    { label: "Kids 24in 6-speed", sizes: ["24in wheel"] },
    { label: "Kids 16in with stabilisers", sizes: ["16in wheel"] },
  ],
};

/** Rough mix of donated bikes by type (hybrids and MTBs dominate donations). */
const TYPE_WEIGHTS: [BikeType, number][] = [
  ["hybrid", 0.28],
  ["mountain", 0.27],
  ["city", 0.17],
  ["road", 0.14],
  ["kids", 0.14],
];

const COLORS = [
  "Black", "Silver", "Dark blue", "Red", "White", "Green", "Grey", "Orange",
  "Matte black", "Light blue", "Yellow", "Purple",
] as const;

/** Probability that a donated bike has a fault in each category. */
const FAULT_RATES: Record<IssueCategory, number> = {
  chain: 0.58,
  brakes: 0.52,
  gearing: 0.45,
  wheels: 0.36,
  other: 0.2,
  frame: 0.07,
};

const FAULT_NOTES: Record<IssueCategory, readonly string[]> = {
  chain: ["Rusty chain", "Chain skips under load", "Dry, stiff chain links", "Chain stretched past 0.75%"],
  brakes: ["Worn rear brake pads", "Spongy front brake lever", "Rear brake cable seized", "Brake pads hitting tyre"],
  gearing: ["Rear derailleur out of index", "Frayed shifter cable", "Front mech won't shift to big ring", "Bent derailleur hanger"],
  wheels: ["Flat rear", "Flat front", "Front wheel out of true", "Loose rear hub cones", "Perished tyres"],
  frame: ["Dent on top tube — check for cracks", "Surface rust on chainstay"],
  other: ["Loose headset", "Missing left pedal", "Creaky bottom bracket", "Torn saddle", "No reflectors"],
};

/** Stage mix for the ~60 seeded bikes. */
const STAGE_COUNTS: Record<Stage, number> = {
  intake: 6,
  diagnosis: 7,
  repair: 9,
  qa: 10,
  shipped: 28,
};

/** Intake-date window per final stage, so every later event still lands before the reference date. */
const INTAKE_WINDOWS: Record<Stage, [string, string]> = {
  shipped: ["2026-01-05", "2026-06-15"],
  qa: ["2026-05-01", "2026-09-20"],
  repair: ["2026-07-20", "2026-10-08"],
  diagnosis: ["2026-09-15", "2026-10-20"],
  intake: ["2026-10-10", "2026-10-29"],
};

/** Max days spent in each stage before advancing. */
const STAGE_GAP_DAYS: Record<Exclude<Stage, "shipped">, [number, number]> = {
  intake: [1, 5],
  diagnosis: [2, 14],
  repair: [3, 20],
  qa: [0, 0], // qa -> shipped uses the container ship date
};

const ADVANCE_NOTES: Partial<Record<Stage, readonly string[]>> = {
  diagnosis: ["Initial look-over done", "", "Put on the stand"],
  repair: ["Parts pulled from stock", "", "Parts list drawn up"],
  qa: ["Test ridden around the yard", "", "Brakes and gears checked"],
  shipped: ["Loaded into container"],
};

function pickType(rng: Rng): BikeType {
  let r = rng();
  for (const [type, w] of TYPE_WEIGHTS) {
    if ((r -= w) < 0) return type;
  }
  return TYPE_WEIGHTS[0][0];
}

function rollFaults(rng: Rng, type: BikeType): IssueCategory[] {
  const faults = ISSUE_CATEGORIES.filter((c) => {
    // Kids bikes rarely have gears worth indexing.
    const rate = type === "kids" && c === "gearing" ? 0.15 : FAULT_RATES[c];
    return rng() < rate;
  });
  return faults.length > 0 ? faults : [pick(rng, ["chain", "brakes", "wheels"] as const)];
}

function buildNotes(rng: Rng, faults: IssueCategory[]): string {
  const picked = shuffle(rng, faults).slice(0, int(rng, 1, 2));
  return picked.map((c) => pick(rng, FAULT_NOTES[c])).join(", ");
}

interface Draft {
  stage: Stage;
  intakeAt: number;
}

export function createSeedState(): AppState {
  const rng = mulberry32(SEED);

  const drafts: Draft[] = [];
  for (const stage of STAGES) {
    const [from, to] = INTAKE_WINDOWS[stage];
    const span = (utc(to) - utc(from)) / DAY_MS;
    for (let i = 0; i < STAGE_COUNTS[stage]; i++) {
      const day = utc(from) + int(rng, 0, span) * DAY_MS;
      const minutes = int(rng, 9 * 60, 16 * 60); // workshop hours, 09:00–16:00 UTC
      drafts.push({ stage, intakeAt: day + minutes * 60 * 1000 });
    }
  }
  // ids follow arrival order
  drafts.sort((a, b) => a.intakeAt - b.intakeAt);

  const bikes: Bike[] = drafts.map((d, i) => {
    const type = pickType(rng);
    const template = pick(rng, TEMPLATES[type]);
    const allFaults = rollFaults(rng, type);
    const finalIdx = STAGES.indexOf(d.stage);

    const history: HistoryEvent[] = [
      { at: new Date(d.intakeAt).toISOString(), stage: "intake", note: "Received donated bike at intake" },
    ];
    let t = d.intakeAt;
    for (let s = 1; s <= finalIdx; s++) {
      const stage = STAGES[s];
      const prev = STAGES[s - 1] as Exclude<Stage, "shipped">;
      if (stage === "shipped") {
        t = ZNZ1_SHIP_AT;
      } else {
        const [lo, hi] = STAGE_GAP_DAYS[prev];
        t += int(rng, lo, hi) * DAY_MS + int(rng, 0, 6) * 60 * 60 * 1000;
      }
      const extra = pick(rng, ADVANCE_NOTES[stage] ?? [""]);
      const base = `Moved to ${STAGE_LABELS[stage]}`;
      history.push({ at: new Date(t).toISOString(), stage, note: extra ? `${base} — ${extra}` : base });
    }

    // Faults are recorded during diagnosis: always set once past it, sometimes already while in it.
    const faults =
      finalIdx > STAGES.indexOf("diagnosis") || (d.stage === "diagnosis" && rng() < 0.5) ? allFaults : [];

    let shipmentId: string | null = null;
    if (d.stage === "shipped") {
      shipmentId = "SH-ZNZ-1";
    } else if (d.stage === "qa") {
      shipmentId = type === "kids" ? "SH-LOC-1" : rng() < 0.85 ? "SH-ZNZ-2" : null;
    } else if (d.stage === "repair") {
      const r = rng();
      shipmentId = type === "kids" || r < 0.2 ? "SH-LOC-1" : r < 0.5 ? "SH-ZNZ-2" : null;
    }

    return {
      id: `BK-${String(i + 1).padStart(4, "0")}`,
      label: template.label,
      type,
      size: pick(rng, template.sizes),
      color: pick(rng, COLORS),
      intakeDate: new Date(d.intakeAt).toISOString().slice(0, 10),
      stage: d.stage,
      faults,
      notes: buildNotes(rng, allFaults),
      shipmentId,
      history,
    };
  });

  return { bikes, shipments: SEED_SHIPMENTS.map((s) => ({ ...s })) };
}
