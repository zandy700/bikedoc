import { describe, expect, it } from "vitest";
import { diagnosisSchema } from "./schema";
import { diagnoseByRules, RULES, scoreConfidence, stem } from "./rules";

const run = (description: string, hasImage = false) => diagnoseByRules({ description, hasImage });
const guideIds = (description: string) => run(description).issues.map((i) => i.guideId);

describe("stem", () => {
  it("normalises common inflections to the same stem", () => {
    expect(stem("skipping")).toBe(stem("skips"));
    expect(stem("skipped")).toBe(stem("skip"));
    expect(stem("wobbling")).toBe(stem("wobble"));
    expect(stem("wobbly")).toBe(stem("wobbles"));
    expect(stem("brakes")).toBe(stem("braking"));
    expect(stem("tyre")).toBe(stem("tires"));
    expect(stem("squeaky")).toBe(stem("squealing"));
    expect(stem("pedalling")).toBe(stem("pedaling"));
  });
});

describe("diagnoseByRules — symptom mapping", () => {
  it("maps skipping gears to derailleur indexing", () => {
    const d = run("Skipping gears on the rear");
    expect(d.issues[0].guideId).toBe("index-rear-derailleur");
    expect(d.issues[0].category).toBe("gearing");
  });

  it("maps ghost shifting to derailleur indexing", () => {
    expect(guideIds("It keeps ghost shifting on hills")).toContain("index-rear-derailleur");
  });

  it("maps chain slipping under load to chain wear check", () => {
    const ids = guideIds("The chain slips under load when I climb");
    expect(ids).toContain("chain-wear-check");
  });

  it("maps a rusty chain to chain replacement", () => {
    const d = run("Very rusty chain with stiff links");
    expect(d.issues[0].guideId).toBe("chain-replacement");
    expect(d.issues[0].category).toBe("chain");
  });

  it("maps squealing rim brakes to toe-in", () => {
    const ids = guideIds("Front brake squeals loudly when stopping");
    expect(ids).toContain("rim-brake-toe-in");
    expect(ids).not.toContain("disc-rotor-rub");
  });

  it("maps squeal on a disc brake to the disc guide, not toe-in", () => {
    const ids = guideIds("Disc brake squeals and the rotor looks warped");
    expect(ids).toContain("disc-rotor-rub");
    expect(ids).not.toContain("rim-brake-toe-in");
  });

  it("maps spongy brakes to cable tension", () => {
    expect(guideIds("Brakes feel spongy")[0]).toBe("brake-cable-tension");
  });

  it("maps lever pulling all the way to the bar to cable tension", () => {
    const d = run("The rear brake lever pulls all the way to the bar");
    expect(d.issues[0].guideId).toBe("brake-cable-tension");
    expect(d.issues[0].evidence).toContain("lever pulls all the way to the bar");
  });

  it("maps 'brakes don't work' (contraction) to cable tension", () => {
    expect(guideIds("The brakes don't work at all")).toContain("brake-cable-tension");
  });

  it("maps worn pads / metal on metal to pad replacement", () => {
    expect(guideIds("Pads are worn, grinding metal on metal")).toContain("brake-pad-replacement");
  });

  it("maps a wobbly wheel to truing", () => {
    expect(guideIds("Back wheel is wobbly and rubs the brake pads")[0]).toBe("wheel-truing");
  });

  it("maps a broken spoke to truing", () => {
    expect(guideIds("One broken spoke on the rear wheel")).toContain("wheel-truing");
  });

  it("maps a flat/puncture to flat repair", () => {
    expect(guideIds("Front tyre is flat")[0]).toBe("flat-tire-repair");
    expect(guideIds("Got a puncture, won't hold air")).toContain("flat-tire-repair");
  });

  it("maps grinding hub to hub bearing check", () => {
    expect(guideIds("Rear hub grinding and the wheel has play")[0]).toBe("hub-bearing-check");
  });

  it("maps creak when pedalling to bottom bracket", () => {
    expect(guideIds("Creaking when pedalling hard")[0]).toBe("bottom-bracket-check");
  });

  it("maps clicking with every pedal stroke to bottom bracket", () => {
    expect(guideIds("A click on every pedal stroke")).toContain("bottom-bracket-check");
  });

  it("maps play in the crank to bottom bracket", () => {
    expect(guideIds("There is play in the crank")).toContain("bottom-bracket-check");
  });

  it("maps knocking at the headset to headset adjustment", () => {
    const d = run("Knocking at the headset when I use the front brake");
    expect(d.issues[0].guideId).toBe("headset-adjustment");
    expect(d.issues[0].category).toBe("other");
  });

  it("maps cracks and dents to frame inspection", () => {
    expect(guideIds("Crack near the head tube")[0]).toBe("frame-crack-inspection");
    expect(guideIds("Dented top tube")).toContain("frame-crack-inspection");
  });

  it("does not treat a cracked tyre sidewall as frame damage", () => {
    const ids = guideIds("Cracked tyre sidewall");
    expect(ids).toContain("flat-tire-repair");
    expect(ids).not.toContain("frame-crack-inspection");
  });

  it("uses a carbon-specific title and puts a frame warning in the summary", () => {
    const d = run("Carbon fork has a crack after a crash");
    const frame = d.issues.find((i) => i.guideId === "frame-crack-inspection");
    expect(frame?.title).toMatch(/carbon/i);
    expect(d.summary).toMatch(/do not ship/i);
  });

  it("maps generic rust to a guide-less corrosion issue", () => {
    const d = run("Bolts and cables are rusty");
    expect(d.issues[0].guideId).toBeNull();
    expect(d.issues[0].category).toBe("other");
  });
});

describe("diagnoseByRules — negation", () => {
  it("ignores 'no squeal'", () => {
    const ids = guideIds("No squeal from the brakes, but the gears are skipping");
    expect(ids).not.toContain("rim-brake-toe-in");
    expect(ids).toContain("index-rear-derailleur");
  });

  it("ignores 'not skipping'", () => {
    expect(guideIds("Gears are not skipping")).not.toContain("index-rear-derailleur");
  });

  it("ignores 'doesn't wobble' while keeping other clauses", () => {
    const ids = guideIds("The wheel doesn't wobble. Front tyre is flat");
    expect(ids).not.toContain("wheel-truing");
    expect(ids).toContain("flat-tire-repair");
  });

  it("scopes negation to its clause", () => {
    expect(guideIds("No flat, but it creaks")).toEqual(["bottom-bracket-check"]);
  });
});

describe("diagnoseByRules — scoring, limits and fallbacks", () => {
  it("gives higher confidence with more matching phrases, capped at 0.9", () => {
    const one = run("Skipping").issues[0].confidence;
    const many = run(
      "Skipping gears, ghost shifting, hard to shift, bent derailleur hanger, shifter cable frayed",
    ).issues.find((i) => i.guideId === "index-rear-derailleur")!.confidence;
    expect(many).toBeGreaterThan(one);
    expect(many).toBeLessThanOrEqual(0.9);
    expect(scoreConfidence(100, 100)).toBe(0.9);
  });

  it("sorts issues by confidence descending", () => {
    const d = run("Spongy brakes, lever pulls to the bar, weak brakes. Also a flat tyre.");
    const confs = d.issues.map((i) => i.confidence);
    expect([...confs].sort((a, b) => b - a)).toEqual(confs);
    expect(d.issues[0].guideId).toBe("brake-cable-tension");
  });

  it("caps at 8 issues with no duplicate guides", () => {
    const d = run(
      "Skipping gears, chain stretched, broken chain, worn pads, spongy brakes, squeal, rotor rub, wobble, flat tyre, hub grinding, creaks when pedalling, headset knock, cracked frame, rusty bolts",
    );
    expect(d.issues.length).toBe(8);
    const ids = d.issues.map((i) => i.guideId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("quotes matched phrases in the evidence", () => {
    const d = run("Gears skipping and ghost shifting");
    expect(d.issues[0].evidence).toContain('"ghost shifting"');
  });

  it("returns a low-confidence safety inspection for unmatched text", () => {
    const d = run("It was donated last week by a neighbour");
    expect(d.issues).toHaveLength(1);
    expect(d.issues[0].confidence).toBeLessThanOrEqual(0.3);
    expect(d.issues[0].title).toMatch(/safety inspection/i);
  });

  it("returns a safety inspection for empty input", () => {
    const d = run("   ");
    expect(d.issues).toHaveLength(1);
    expect(d.issues[0].confidence).toBeLessThanOrEqual(0.3);
  });

  it("explains that demo mode can't analyse photos for image-only input", () => {
    const d = run("", true);
    expect(d.summary).toMatch(/can't analyse photos/i);
    expect(d.summary).toMatch(/describe/i);
    expect(d.issues[0].confidence).toBeLessThanOrEqual(0.3);
  });

  it("notes the unanalysed photo when text and image are both given", () => {
    expect(run("flat tyre", true).summary).toMatch(/photo was not analysed/i);
  });

  it("is deterministic", () => {
    const text = "Chain skips, brakes squeal, wheel wobbles";
    expect(run(text)).toEqual(run(text));
  });

  it("always returns schema-valid output", () => {
    const inputs = [
      "",
      "x".repeat(2000),
      "Skipping gears, chain stretched, broken chain, worn pads, spongy brakes, squeal, rotor rub, wobble, flat, hub grinding, creak, headset knock, cracked frame, ".repeat(5),
      "¿Qué? 🚲 brakes!!!",
    ];
    for (const description of inputs) {
      for (const hasImage of [false, true]) {
        expect(diagnosisSchema.safeParse(diagnoseByRules({ description, hasImage })).success).toBe(true);
      }
    }
  });

  it("has one rule per guide", () => {
    const ids = RULES.map((r) => r.guideId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
