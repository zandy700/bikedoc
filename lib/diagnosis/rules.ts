/**
 * Deterministic, keyword-based diagnosis used in demo mode and as the AI fallback.
 *
 * Pipeline: normalise text -> split into clauses -> drop stopwords -> light stemming
 * and synonym mapping -> phrase matching (small gaps allowed) -> negation check
 * ("no squeal", "not skipping") -> score. Each rule maps to one guide (unique per rule).
 */
import type { GuideId, IssueCategory } from "@/lib/types";
import type { Diagnosis, Issue } from "./schema";

/* ------------------------------------------------------------------ */
/* Text processing                                                     */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "a", "an", "the", "my", "its", "it", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "on", "in", "at", "into", "onto", "this", "that", "these", "those",
  "very", "really", "quite", "bit", "little", "some", "any", "when", "whenever", "while",
  "i", "me", "we", "you", "he", "she", "they", "there", "has", "have", "had", "so", "just",
  "also", "do", "does", "did", "will", "would", "can", "could", "wo", "ca", "seems", "seem",
  "kind", "sort", "like", "lot", "all", "way", "up", "then", "with", "from", "for", "by",
]);

const NEGATORS = new Set(["no", "not", "never", "without", "none", "nothing", "nor"]);
/** Words a gapped phrase match may not skip over ("gears not skipping" must not match "gear skip"). */
const GAP_BARRIERS = new Set([...NEGATORS, "and", "or", "plus"]);

/** Post-stem canonical forms (synonyms and irregular forms). */
const CANONICAL: Record<string, string> = {
  squeak: "squeal",
  squeek: "squeal",
  squeaky: "squeal",
  squealy: "squeal",
  screech: "squeal",
  screechy: "squeal",
  shriek: "squeal",
  tyr: "tir",
  wobbly: "wobbl",
  creaky: "creak",
  noisy: "nois",
  rusty: "rust",
  spongy: "spong",
  spongey: "spong",
  squishy: "spong",
  mushy: "spong",
  sticky: "stick",
  stuck: "stick",
  notchy: "notch",
  pedall: "pedal",
  bent: "bend",
  dont: "not",
  doesnt: "not",
  didnt: "not",
  wont: "not",
  cant: "not",
  cannot: "not",
  isnt: "not",
  arent: "not",
  wasnt: "not",
  werent: "not",
  wouldnt: "not",
  couldnt: "not",
  steering: "steer",
  handlebar: "bar",
  handlebars: "bar",
  disk: "disc",
};

export function stem(word: string): string {
  let w = word.toLowerCase();
  if (CANONICAL[w]) return CANONICAL[w];
  if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) w = w.slice(0, -1);
  let stripped = false;
  if (w.length > 5 && w.endsWith("ing")) {
    w = w.slice(0, -3);
    stripped = true;
  } else if (w.length > 4 && w.endsWith("ed")) {
    w = w.slice(0, -2);
    stripped = true;
  }
  if (stripped && w.length > 3 && /([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|zz)$/.test(w)) {
    w = w.slice(0, -1);
  }
  if (w.length > 3 && w.endsWith("e")) w = w.slice(0, -1);
  return CANONICAL[w] ?? w;
}

interface Token {
  stem: string;
  /** index into the clause's raw word list */
  rawIndex: number;
}

interface Clause {
  raw: string[];
  tokens: Token[];
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/n't\b/g, " not")
    .replace(/'/g, "");
}

const CLAUSE_SPLIT = /[.;:!?,\n()]+|\bbut\b|\bhowever\b|\balthough\b|\bthough\b|\bexcept\b/;

function toClauses(text: string): Clause[] {
  return normalise(text)
    .split(CLAUSE_SPLIT)
    .map((part) => {
      const raw = part.split(/[^a-z0-9]+/).filter(Boolean);
      const tokens: Token[] = [];
      raw.forEach((w, i) => {
        if (!STOPWORDS.has(w)) tokens.push({ stem: stem(w), rawIndex: i });
      });
      return { raw, tokens };
    })
    .filter((c) => c.tokens.length > 0);
}

/** A pattern is a sequence of stemmed terms; a trailing "*" means prefix match. */
function compilePhrase(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map((w) => (w.endsWith("*") ? w : stem(w)));
}

function termMatches(term: string, tokenStem: string): boolean {
  return term.endsWith("*") ? tokenStem.startsWith(term.slice(0, -1)) : term === tokenStem;
}

/** Max number of unrelated content words allowed between consecutive pattern terms. */
const MAX_GAP = 2;
/** How many content words before a match to search for a negator. */
const NEGATION_WINDOW = 3;

interface Span {
  clause: number;
  start: number;
  end: number;
}

function isNegated(tokens: Token[], start: number): boolean {
  for (let k = start - 1; k >= Math.max(0, start - NEGATION_WINDOW); k--) {
    if (NEGATORS.has(tokens[k].stem)) return true;
  }
  return false;
}

function findPhrase(clauses: Clause[], terms: string[]): Span | null {
  for (let c = 0; c < clauses.length; c++) {
    const tokens = clauses[c].tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (!termMatches(terms[0], tokens[i].stem)) continue;
      let pos = i;
      let ok = true;
      for (let t = 1; t < terms.length && ok; t++) {
        let found = -1;
        for (let j = pos + 1; j <= Math.min(tokens.length - 1, pos + 1 + MAX_GAP); j++) {
          if (termMatches(terms[t], tokens[j].stem)) {
            found = j;
            break;
          }
          if (GAP_BARRIERS.has(tokens[j].stem)) break;
        }
        if (found < 0) ok = false;
        else pos = found;
      }
      if (ok && !isNegated(tokens, i)) return { clause: c, start: i, end: pos };
    }
  }
  return null;
}

/** True if any of the terms appears anywhere in the text (not negated). */
function hasAnyTerm(clauses: Clause[], terms: string[][]): boolean {
  return terms.some((t) => findPhrase(clauses, t) !== null);
}

function quote(clauses: Clause[], span: Span): string {
  const clause = clauses[span.clause];
  const from = clause.tokens[span.start].rawIndex;
  const to = clause.tokens[span.end].rawIndex;
  return clause.raw.slice(from, to + 1).join(" ");
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

type PatternSpec = string | { p: string; any?: string[]; none?: string[] };

interface Rule {
  guideId: GuideId | null;
  category: IssueCategory;
  title: string;
  /** Alternative title when any of these terms appears in the description */
  titleIf?: { any: string[]; title: string };
  patterns: PatternSpec[];
}

const DISC = ["disc", "rotor", "hydraulic"];
const FRONT_END = ["headset", "steer", "fork", "front", "bar", "stem"];

export const RULES: Rule[] = [
  {
    guideId: "frame-crack-inspection",
    category: "frame",
    title: "Possible frame or fork damage — inspect before any repair",
    titleIf: {
      any: ["carbon"],
      title: "Possible carbon frame or fork damage — retire or refer to a specialist",
    },
    patterns: [
      { p: "crack", none: ["tire", "sidewall", "rim", "pad"] },
      "frame crack", "crack frame", "fork crack", "crack fork", "weld crack", "crack weld",
      { p: "dent", none: ["rim"] },
      "frame dent", "dent frame", "bend frame", "frame bend", "bend fork", "fork bend",
      "frame misalign", "frame alignment", "bend dropout", "dropout bend", "dropout crack",
      "crash", "accident", "impact", "hit car", "ripple paint", "paint ripple",
      "wrinkle paint", "paint wrinkle", "carbon damage", "damage carbon", "delamin*",
      "rust frame", "frame rust", "frame corro*", "corro* frame",
    ],
  },
  {
    guideId: "brake-cable-tension",
    category: "brakes",
    title: "Weak or spongy brakes — check cable, housing and tension",
    patterns: [
      "spong", "soft lever", "lever soft", "soft brake", "brake soft",
      "lever pull bar", "lever bar", "lever touch bar", "lever hit bar", "lever bottom", "bottom out",
      "lever travel", "weak brake", "brake weak", "poor brake", "brake poor",
      "brake not work", "brake barely", "brake useless", "useless brake", "brake fail", "fail brake",
      "not stop", "hard stop", "long stop", "no stopping power", "stopping power",
      "brake cable", "cable fray", "fray cable", "frayed", "brake stick", "stick brake",
      "brake not release", "lever loose", "loose lever", "lever stick", "brake slack",
      { p: "cable slack", none: ["gear", "shift", "derailleur"] },
      { p: "slack cable", none: ["gear", "shift", "derailleur"] },
      { p: "cable loose", none: ["gear", "shift", "derailleur"] },
      { p: "loose cable", none: ["gear", "shift", "derailleur"] },
      { p: "cable stretch", none: ["gear", "shift", "derailleur"] },
    ],
  },
  {
    guideId: "brake-pad-replacement",
    category: "brakes",
    title: "Brake pads worn or contaminated",
    patterns: [
      "worn pad", "pad worn", "pad wear", "wear pad", "pad thin", "thin pad", "pad gone",
      "no pad", "pad missing", "missing pad", "metal metal", "grind brake", "brake grind",
      "scrape brake", "brake scrape", "pad hard", "hard pad", "pad crack", "crack pad",
      "pad glaze", "glaze pad", "contamin*", "oil rotor", "rotor oil",
      "replace pad", "new pad", "pad need replac*",
    ],
  },
  {
    guideId: "rim-brake-toe-in",
    category: "brakes",
    title: "Rim brake pads squeal or are misaligned — set pad alignment and toe-in",
    patterns: [
      { p: "squeal", none: [...DISC, "chain"] },
      { p: "brake squeal", none: DISC },
      { p: "brake nois", none: DISC },
      { p: "nois brake", none: DISC },
      { p: "howl", none: DISC },
      { p: "shudder", none: DISC },
      { p: "judder", none: DISC },
      "pad tire", "pad touch tire", "pad rub tire", "pad hit tire",
      "pad misalign", "misalign pad", "pad alignment", "toe in", "toe",
    ],
  },
  {
    guideId: "disc-rotor-rub",
    category: "brakes",
    title: "Disc brake rub or noise — re-centre caliper and check rotor",
    patterns: [
      "rotor rub", "disc rub", "rub rotor", "rub disc", "rotor bend", "bend rotor",
      "warp rotor", "rotor warp", "bend disc", "disc bend", "disc warp",
      "caliper rub", "caliper misalign", "caliper alignment",
      "rotor nois", "disc nois", "rotor scrape", "disc scrape",
      "piston stick", "stick piston",
      { p: "rub", any: DISC },
      { p: "squeal", any: DISC },
      { p: "ting", any: DISC },
      { p: "grind", any: ["disc", "rotor"] },
    ],
  },
  {
    guideId: "index-rear-derailleur",
    category: "gearing",
    title: "Shifting problems — check hanger, limit screws and indexing",
    patterns: [
      "skip", "skip gear", "gear skip", "jump gear", "gear jump", "ghost shift",
      "shift itself", "shift own", "not shift", "shift poor", "poor shift", "bad shift",
      "shift bad", "hard shift", "shift hard", "slow shift", "shift slow",
      "hesitat*", "gear slip", "slip gear", "slip out gear", "not stay gear",
      "derailleur", "hanger", "index*", "gear cable", "shift cable", "shifter",
      "chain fall off", "chain come off", "chain drop", "drop chain", "chain spoke",
      "gear nois", "nois gear", "gear click", "click gear", "gear rattle", "rattle gear",
      "shift problem", "gear problem",
      { p: "cable slack", none: ["brake"] },
      { p: "cable loose", none: ["brake"] },
      { p: "loose cable", none: ["brake"] },
      { p: "cable stretch", none: ["brake"] },
    ],
  },
  {
    guideId: "chain-wear-check",
    category: "chain",
    title: "Chain may be worn or stretched — measure wear",
    patterns: [
      "chain skip", "chain slip", "skip load", "slip load", "skip climb", "slip climb",
      "skip pedal hard", "slip pedal hard", "chain stretch", "stretch chain",
      "worn chain", "chain worn", "chain wear", "wear chain", "old chain", "chain old",
      "chain jump", "dry chain", "chain dry", "chain squeal", "squeal chain",
      "chain nois", "nois chain", "worn cassette", "cassette worn", "worn sprocket",
      "sprocket worn", "worn freewheel", "worn chainring", "shark tooth", "shark fin",
    ],
  },
  {
    guideId: "chain-replacement",
    category: "chain",
    title: "Chain damaged — replace the chain",
    patterns: [
      "broken chain", "chain broke", "chain broken", "chain snap", "snap chain",
      "stiff link", "chain stiff", "stiff chain", "chain kink", "kink chain", "kink",
      "chain seiz", "seiz chain", "rust chain", "chain rust", "chain corro*",
      "missing chain", "no chain", "chain missing", "twist chain", "chain twist",
      "chain bend", "bend chain", "bend link",
    ],
  },
  {
    guideId: "wheel-truing",
    category: "wheels",
    title: "Wheel out of true or spoke problem — true the wheel",
    patterns: [
      { p: "wobbl", none: ["crank", "pedal", "headset", "bar", "stem"] },
      "wheel wobbl", "out true", "untrue", "not true", "buckl*", "bend rim", "rim bend",
      "taco*", "rim rub", "rub rim", "wheel rub", "brake rub",
      { p: "rub", none: [...DISC, "chain", "derailleur", "tire"] },
      "loose spoke", "spoke loose", "broken spoke", "spoke broken", "spoke broke",
      "missing spoke", "spoke snap", "snap spoke", "spoke ping", "ping", "hop",
      "rim dent", "dent rim", "flat spot", "wheel bend", "bend wheel", "wheel not straight",
      "wheel warp", "warp wheel", "rim warp", "warp rim", "rim crack", "crack rim",
    ],
  },
  {
    guideId: "flat-tire-repair",
    category: "wheels",
    title: "Flat or damaged tyre — find the cause and repair",
    patterns: [
      { p: "flat", none: ["spot"] },
      "punctur*", "inner tube", "leak",
      { p: "tube", none: ["head", "down", "top", "seat", "frame"] }, "lose air", "lost air", "not hold air", "not hold pressure",
      "lose pressure", "lost pressure", "deflat*", "pinch flat", "snakebit*", "snake bite",
      "tire soft", "soft tire", "tire low", "low tire", "low pressure", "valve",
      "tire crack", "crack tire", "sidewall", "bald tire", "worn tire", "tire worn",
      "tire bulg*", "bulg*", "tire torn", "torn tire", "tire cut", "cut tire",
      "tire split", "split tire", "thorn", "glass",
    ],
  },
  {
    guideId: "hub-bearing-check",
    category: "wheels",
    title: "Hub bearing play or roughness — check and adjust cones",
    patterns: [
      "hub grind", "grind hub", "hub rough", "rough hub", "hub play", "play hub",
      "wheel play", "play wheel", "wheel loose", "loose wheel", "loose hub", "hub loose",
      "wheel knock", "axle loose", "loose axle", "wheel side side", "wheel wiggl", "wiggl wheel",
      "wheel grind", "grind wheel", "wheel not spin", "wheel stiff", "stiff wheel",
      "wheel tight", "hub tight", "hub nois", "nois hub", "cone",
      { p: "bear*", any: ["hub", "wheel", "axle"] },
      { p: "grind", any: ["hub", "wheel", "axle"], none: ["brake", "pad", "disc", "rotor"] },
    ],
  },
  {
    guideId: "bottom-bracket-check",
    category: "other",
    title: "Creak or play at the cranks — check bottom bracket and crank bolts",
    patterns: [
      "creak", "crank play", "play crank", "crank loose", "loose crank", "crank wobbl",
      "wobbl crank", "crank knock", "knock crank", "crank mov*", "crank wiggl",
      "crank side side", "bottom bracket", "bb", "crank grind", "grind crank",
      "pedal creak", "creak pedal", "pedal knock", "pedal loose", "loose pedal",
      "pedal clunk", "clunk pedal", "crank arm loose",
      { p: "click", any: ["pedal", "crank"] },
      { p: "grind", any: ["pedal", "crank"], none: ["brake", "pad", "disc", "rotor"] },
      { p: "knock", any: ["pedal", "crank"] },
    ],
  },
  {
    guideId: "headset-adjustment",
    category: "other",
    title: "Headset loose or rough — check and adjust headset",
    patterns: [
      "headset", "head set", "steer loose", "loose steer", "steer stiff", "stiff steer",
      "steer tight", "tight steer", "steer notch", "notch steer", "notch", "steer catch",
      "steer rough", "rough steer", "fork play", "play fork", "fork loose", "loose fork",
      "front end knock", "front knock", "knock front", "front clunk", "clunk front",
      "knock brake", "clunk brake", "bar loose", "loose bar", "stem loose", "loose stem",
      "bar turn independ*", "bar wiggl", "bar mov*",
      { p: "knock", any: FRONT_END },
      { p: "clunk", any: FRONT_END },
    ],
  },
  {
    guideId: null,
    category: "other",
    title: "Rust or corrosion on components — inspect cables, bolts and bearings",
    patterns: [
      { p: "rust", none: ["chain", "frame"] },
      { p: "corro*", none: ["chain", "frame"] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

interface CompiledPattern {
  terms: string[];
  any?: string[][];
  none?: string[][];
}

const compileTerms = (list?: string[]) => list?.map((t) => compilePhrase(t));

const COMPILED = RULES.map((rule) => ({
  rule,
  patterns: rule.patterns.map<CompiledPattern>((spec) =>
    typeof spec === "string"
      ? { terms: compilePhrase(spec) }
      : { terms: compilePhrase(spec.p), any: compileTerms(spec.any), none: compileTerms(spec.none) },
  ),
  titleIf: rule.titleIf ? { any: compileTerms(rule.titleIf.any)!, title: rule.titleIf.title } : undefined,
}));

const MAX_ISSUES = 8;
const MAX_CONFIDENCE = 0.9;

interface Hit {
  span: Span;
  length: number;
}

function overlaps(a: Span, b: Span): boolean {
  return a.clause === b.clause && a.start <= b.end && b.start <= a.end;
}

export function scoreConfidence(hits: number, multiWordHits: number): number {
  if (hits <= 0) return 0;
  const raw = 0.4 + 0.15 * hits + 0.05 * Math.min(multiWordHits, 2);
  return Math.round(Math.min(MAX_CONFIDENCE, raw) * 100) / 100;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

interface Candidate {
  issue: Issue;
  order: number;
}

export function diagnoseByRules(input: { description: string; hasImage: boolean }): Diagnosis {
  const description = (input.description ?? "").slice(0, 4000);
  const clauses = toClauses(description);

  const candidates: Candidate[] = [];

  COMPILED.forEach(({ rule, patterns, titleIf }, order) => {
    const hits: Hit[] = [];
    for (const pat of patterns) {
      if (pat.terms.length === 0) continue;
      if (pat.any && !hasAnyTerm(clauses, pat.any)) continue;
      if (pat.none && hasAnyTerm(clauses, pat.none)) continue;
      const span = findPhrase(clauses, pat.terms);
      if (span) hits.push({ span, length: span.end - span.start + 1 });
    }
    if (hits.length === 0) return;

    // Keep the longest non-overlapping matches so "chain skips" isn't also counted as "skips".
    hits.sort((a, b) => b.length - a.length);
    const accepted: Hit[] = [];
    for (const h of hits) if (!accepted.some((a) => overlaps(a.span, h.span))) accepted.push(h);

    const quotes = [...new Set(accepted.map((h) => quote(clauses, h.span)))];
    const multi = accepted.filter((h) => h.length > 1).length;
    const title = titleIf && hasAnyTerm(clauses, titleIf.any) ? titleIf.title : rule.title;
    candidates.push({
      order,
      issue: {
        category: rule.category,
        title,
        confidence: scoreConfidence(quotes.length, multi),
        evidence: truncate(`Description mentions ${quotes.map((q) => `"${q}"`).join(", ")}.`, 600),
        guideId: rule.guideId,
      },
    });
  });

  const issues = candidates
    .sort((a, b) => b.issue.confidence - a.issue.confidence || a.order - b.order)
    .slice(0, MAX_ISSUES)
    .map((c) => c.issue);

  if (issues.length === 0) return fallback(description, input.hasImage);

  const parts = [
    `Rule-based demo diagnosis found ${issues.length} likely issue${issues.length === 1 ? "" : "s"}: ${issues
      .map((i) => i.title.split(" — ")[0])
      .join("; ")}.`,
  ];
  if (issues.some((i) => i.category === "frame")) {
    parts.unshift("Possible frame damage: do not ship this bike until a senior mechanic has inspected it.");
  }
  if (input.hasImage) parts.push("The photo was not analysed in demo mode.");
  parts.push("Confirm every finding by inspection.");

  return { summary: truncate(parts.join(" "), 600), issues };
}

function fallback(description: string, hasImage: boolean): Diagnosis {
  const hasText = description.trim().length > 0;
  if (!hasText && hasImage) {
    return {
      summary:
        "Demo mode can't analyse photos. Describe the symptoms (noises, when they happen, what feels wrong when riding, braking or shifting) to get a targeted diagnosis. Until then, run a full safety inspection.",
      issues: [
        {
          category: "other",
          title: "Photo not analysed — describe symptoms or run a full safety inspection",
          confidence: 0.2,
          evidence:
            "A photo was provided, but the rule-based demo mode only reads text descriptions. Inspect frame and fork, wheels and tyres, brakes, drivetrain and headset in order.",
          guideId: "frame-crack-inspection",
        },
      ],
    };
  }
  return {
    summary: truncate(
      `${hasText ? "No specific symptoms were recognised in the description." : "No description was provided."} Run a full safety inspection (frame, wheels, brakes, drivetrain, headset).${
        hasImage ? " The photo was not analysed in demo mode." : ""
      }`,
      600,
    ),
    issues: [
      {
        category: "other",
        title: "No specific fault recognised — run a full safety inspection",
        confidence: 0.2,
        evidence: hasText
          ? truncate(
              `No known symptom phrases found in "${description.trim()}". Start with the frame and fork, then wheels and tyres, brakes, drivetrain and headset.`,
              600,
            )
          : "Nothing to analyse. Start with the frame and fork, then wheels and tyres, brakes, drivetrain and headset.",
        guideId: "frame-crack-inspection",
      },
    ],
  };
}
