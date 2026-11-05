import type { Guide } from "@/lib/types";

/**
 * Step-by-step repair guides for volunteer mechanics.
 *
 * Category conventions: hub bearings live under "wheels"; bottom bracket and
 * headset (bearing systems pressed/threaded into the frame) live under "other".
 */
export const GUIDES: Guide[] = [
  {
    id: "index-rear-derailleur",
    title: "Index a rear derailleur",
    category: "gearing",
    summary:
      "Fix skipping, hesitant or noisy shifting by checking the hanger and limit screws first, then setting cable tension with the barrel adjuster.",
    difficulty: "medium",
    timeMinutes: 25,
    tools: [
      "Repair stand",
      "5mm hex key",
      "Small Phillips (JIS #1/#2) screwdriver",
      "Cable cutters",
      "Derailleur hanger alignment gauge (if available)",
      "Fourth-hand cable puller (optional)",
    ],
    parts: ["Inner shift cable (1.1-1.2mm)", "Shift housing and ferrules", "Cable end crimp", "Replacement derailleur hanger (frame-specific)"],
    safetyNotes: [
      "Keep fingers clear of the chain and cassette while turning the cranks.",
      "Over-adjusted inner limit screws let the chain drop into the spokes; this can lock the rear wheel while riding. Always confirm the low limit.",
    ],
    steps: [
      {
        title: "Inspect hanger, cable and housing",
        body: "Shift to the smallest cog. Sight from behind: the jockey wheels should sit in a vertical line under the cog. A bent hanger is the most common cause of poor shifting on donated bikes. Check for frayed inner cable, kinked or cracked housing and missing ferrules.",
        caution: "If the hanger is visibly bent, align it with a hanger gauge or replace it before going further. Indexing a bent hanger never works.",
      },
      {
        title: "Set the high (H) limit screw",
        body: "With the chain on the smallest cog and the cable slack (unclamp it if needed), turn the H screw until the upper jockey wheel sits directly under the outer edge of the smallest cog. The chain should run quietly without trying to drop off.",
      },
      {
        title: "Set the low (L) limit screw",
        body: "Push the derailleur body by hand toward the largest cog while turning the cranks. Adjust the L screw so the jockey wheel lines up under the largest cog and cannot move any further toward the spokes.",
        caution: "Never leave the L screw loose. Test by pushing firmly inward: the chain must not touch the spokes.",
      },
      {
        title: "Check B-tension",
        body: "Shift to the largest cog. Adjust the B-tension screw so the upper jockey wheel is close to, but not touching, the cog (roughly 5-6mm gap on most road and hybrid drivetrains; follow the manufacturer gap for wide-range MTB cassettes).",
      },
      {
        title: "Tension and clamp the cable",
        body: "Shifter in the highest gear (smallest cog), barrel adjusters turned in fully then out one turn. Pull the inner cable snug by hand and clamp it with the 5mm pinch bolt, routing it in the groove under the bolt washer. Trim to 2-3cm and crimp the end.",
      },
      {
        title: "Index with the barrel adjuster",
        body: "Click one shift up. If the chain hesitates or doesn't climb to the second cog, turn the barrel adjuster counter-clockwise (out) a quarter turn at a time. If it overshoots or is noisy, turn it clockwise (in). Repeat until each click moves exactly one cog cleanly.",
      },
      {
        title: "Run through all gears",
        body: "Shift up and down the whole cassette in both chainrings. Fine tune in quarter turns in the middle of the cassette, where indexing errors show most.",
      },
    ],
    verify: [
      "Every click moves exactly one cog, up and down, without delay",
      "No chain noise or rubbing in any gear",
      "Chain cannot be pushed into the spokes or off the smallest cog",
      "Test ride: no ghost shifting under hard pedalling",
    ],
  },
  {
    id: "chain-wear-check",
    title: "Check chain wear",
    category: "chain",
    summary:
      "Measure chain elongation with a chain checker to decide whether the chain (and possibly the cassette and chainrings) needs replacing.",
    difficulty: "easy",
    timeMinutes: 5,
    tools: ["Chain checker (0.5% / 0.75% gauge)", "Rag and degreaser", "12-inch ruler (alternative)"],
    parts: [],
    safetyNotes: [
      "A badly worn chain can skip under load and throw the rider forward; treat chain skip as a safety issue, not a comfort issue.",
    ],
    steps: [
      {
        title: "Clean a section of chain",
        body: "Wipe a section of the chain with a rag so the checker seats properly on the rollers. Heavy grime can give a false reading.",
      },
      {
        title: "Identify the drivetrain speed",
        body: "Count the cogs on the cassette or freewheel. The wear limit depends on the speed: 11 and 12-speed chains are replaced at 0.5%; 10-speed and below (including singlespeed) at 0.75%.",
      },
      {
        title: "Measure with the chain checker",
        body: "Insert the checker on the top run of the chain with light pressure. If the 0.5% or 0.75% tooth drops fully into the chain, it has reached that wear level. Measure in at least three places along the chain.",
      },
      {
        title: "Alternative: ruler method",
        body: "With a 12-inch ruler, line the zero mark up with a pin centre. On a new chain, the 12-inch mark lands exactly on a pin. 1/16 inch past the pin is about 0.5%; 1/8 inch is about 1% and the cassette is likely worn too.",
      },
      {
        title: "Inspect for other damage",
        body: "Look for stiff links (the chain kinks as it passes over the jockey wheels), rust, twisted plates and pins standing proud. Any of these means replace regardless of the measurement.",
      },
      {
        title: "Decide and record",
        body: "Record the reading. Past the limit: replace the chain. If the chain is at 1% or more, expect the cassette/freewheel to skip with a new chain and plan to replace it as well.",
      },
    ],
    verify: [
      "Wear reading recorded on the bike's intake sheet",
      "Decision made: keep, replace chain, or replace chain plus cassette",
    ],
  },
  {
    id: "chain-replacement",
    title: "Replace a chain",
    category: "chain",
    summary:
      "Size, cut and join a new chain of the correct speed, then confirm it shifts across the whole cassette.",
    difficulty: "medium",
    timeMinutes: 20,
    tools: ["Chain tool (breaker)", "Master link pliers", "Chain checker", "Rag", "Chain lube"],
    parts: ["Chain of the correct speed (e.g. 8-speed, 10-speed)", "Matching quick link or connecting pin"],
    safetyNotes: [
      "Quick links are speed-specific and many are single-use (e.g. 11/12-speed); never reuse them.",
      "A badly joined chain can snap under load. Always check the joined link is fully seated.",
    ],
    steps: [
      {
        title: "Match the chain to the drivetrain",
        body: "Count cassette cogs and choose a chain of the same speed. Singlespeed and hub-gear bikes use 1/8 inch chain; derailleur bikes use 3/32 inch.",
      },
      {
        title: "Remove the old chain",
        body: "Open the quick link with master link pliers, or press out a pin with the chain tool. Keep the old chain to compare lengths, but don't rely on it if it was the wrong length.",
      },
      {
        title: "Size the new chain",
        body: "Wrap the new chain around the largest chainring and largest cog, bypassing the rear derailleur. Bring the ends together and add two links (one inch); this is the standard big-big plus two method. Follow the derailleur maker's sizing for 1x MTB drivetrains.",
        caution: "Never test big-big shifting with a chain that is too short; it can tear the derailleur off the hanger.",
      },
      {
        title: "Cut the chain",
        body: "Mark the link and push the pin out with the chain tool so you are left with an inner link on one end and an inner link on the other (for a quick link) or the correct inner/outer pairing (for a connecting pin).",
      },
      {
        title: "Route the chain",
        body: "Thread the chain through the front derailleur cage, around the smallest cog and through the rear derailleur cage, passing in front of the tab between the jockey wheels.",
      },
      {
        title: "Join the chain",
        body: "Fit the quick link, then hold the rear brake and press down on a pedal to snap the link closed. For pinned chains, drive the special connecting pin through and snap off the guide.",
      },
      {
        title: "Check the joint and lubricate",
        body: "Flex the joined link side to side: it must move freely, not kink. Apply a drop of lube to each roller, spin the cranks, and wipe off the excess.",
      },
    ],
    verify: [
      "No stiff links; chain runs smoothly over the jockey wheels",
      "Shifts into big-big and small-small without the derailleur over-stretching or the chain sagging",
      "Quick link fully seated on both sides",
      "Test ride under load: no skipping (if it skips, the cassette is worn too)",
    ],
  },
  {
    id: "brake-pad-replacement",
    title: "Replace brake pads",
    category: "brakes",
    summary:
      "Replace worn rim or disc brake pads, clean the braking surface and bed in the new pads.",
    difficulty: "easy",
    timeMinutes: 20,
    tools: ["4mm and 5mm hex keys", "Needle-nose pliers", "Pad spreader or plastic tyre lever (disc)", "Isopropyl alcohol and clean rag", "Fine sandpaper (rim brakes)"],
    parts: ["Brake pads matched to the caliper model", "Pad retaining pin and clip (disc)"],
    safetyNotes: [
      "Never touch disc pads or rotors with oily fingers; contaminated pads must be replaced, not cleaned.",
      "Every brake job must be checked by a second mechanic before the bike moves to QA.",
    ],
    steps: [
      {
        title: "Assess pad wear",
        body: "Rim pads: replace when the wear grooves are gone or the pad is under about 1mm from the metal holder. Disc pads: replace when the friction material is under 0.5mm, or 2.5-3mm total including the backing plate.",
      },
      {
        title: "Remove the old pads",
        body: "Rim brakes: loosen the pad fixing bolt (usually 5mm) or slide the insert out of cartridge holders after removing the retaining pin. Disc brakes: remove the wheel, pull the retaining clip and pin, then slide the pads out of the caliper.",
      },
      {
        title: "Clean the braking surface",
        body: "Wipe rims with isopropyl alcohol and lightly sand any glazing. Wipe disc rotors with isopropyl alcohol only.",
      },
      {
        title: "Reset pistons (hydraulic disc)",
        body: "Push the pistons back into the caliper with a pad spreader or plastic tyre lever so the thicker new pads fit.",
        caution: "Do not lever against the piston with a metal screwdriver; it can crack ceramic pistons.",
      },
      {
        title: "Fit the new pads",
        body: "Rim pads: note the direction arrow (forward) and left/right markings. Disc pads: fit pads and spring as one unit, reinstall the pin and clip, then refit the wheel.",
      },
      {
        title: "Align and tension",
        body: "Rim pads must hit the braking track squarely, not the tyre and not below the rim (see the toe-in guide). Re-check cable tension after fitting thicker pads.",
      },
      {
        title: "Bed in the pads",
        body: "Pump the lever several times, then do 10-20 controlled stops from moderate speed without locking the wheel to transfer pad material evenly.",
      },
    ],
    verify: [
      "Lever stops firmly well before touching the handlebar",
      "Pads contact only the braking surface",
      "Wheel spins freely with no pad rub",
      "Second mechanic has checked and signed off the brakes",
    ],
  },
  {
    id: "brake-cable-tension",
    title: "Adjust brake cable tension",
    category: "brakes",
    summary:
      "Fix spongy levers or levers that pull to the bar on cable-operated rim and mechanical disc brakes by inspecting the cable and resetting tension.",
    difficulty: "easy",
    timeMinutes: 15,
    tools: ["5mm hex key", "Cable cutters", "Fourth-hand cable puller", "Grease", "Cable end crimps"],
    parts: ["Brake inner cable (1.5-1.6mm, road or MTB head)", "Brake housing (compressionless or standard)", "Ferrules"],
    safetyNotes: [
      "Never use shift cable or shift housing for brakes; brake housing is spiral-wound to resist compression under load.",
      "A frayed or rusty brake cable must be replaced, never just re-tensioned.",
      "Every brake job must be checked by a second mechanic before QA.",
    ],
    steps: [
      {
        title: "Inspect cable and housing",
        body: "Look for fraying at the lever and the anchor bolt, rust, kinks and cracked housing. Pull the lever and watch for housing moving out of its stops. Replace anything damaged.",
      },
      {
        title: "Check the lever and caliper first",
        body: "Make sure the lever clamp is tight and the lever pivot is not seized. Squeeze the caliper by hand: it should spring back freely. A sticky caliper pivot needs cleaning and lubrication before cable adjustment helps.",
      },
      {
        title: "Wind the barrel adjuster in",
        body: "Turn the barrel adjuster at the lever (or caliper) almost fully in, then back out one or two turns so you have adjustment in both directions.",
      },
      {
        title: "Set tension at the anchor bolt",
        body: "Loosen the 5mm anchor bolt, hold the pads about 1-2mm from the rim (or squeeze the caliper with a fourth-hand tool), pull the cable snug and retighten the bolt firmly.",
        caution: "Make sure the cable sits in its groove under the anchor washer; a cable clamped in the wrong place can slip under hard braking.",
      },
      {
        title: "Fine tune with the barrel adjuster",
        body: "Turn the barrel adjuster out to bring the pads closer, in to back them off. Aim for the lever to firm up at roughly one third to one half of its travel.",
      },
      {
        title: "Trim and crimp",
        body: "Cut the inner cable 3-4cm past the anchor bolt and crimp the end to stop fraying.",
      },
      {
        title: "Load test",
        body: "Squeeze the lever hard ten times to seat the cable and housing, then re-check. Tension often drops slightly after this.",
      },
    ],
    verify: [
      "Lever cannot be pulled to the handlebar even with a hard squeeze",
      "Pads release fully; wheel spins with no rub",
      "Barrel adjuster lock ring (if any) tightened",
      "Second mechanic has checked and signed off the brakes",
    ],
  },
  {
    id: "rim-brake-toe-in",
    title: "Align rim brake pads and set toe-in",
    category: "brakes",
    summary:
      "Stop squealing rim brakes and improve power by aligning pads to the braking track with a slight toe-in.",
    difficulty: "medium",
    timeMinutes: 15,
    tools: ["5mm hex key", "10mm wrench (some older pads)", "Business card or thin rubber band (toe-in shim)", "Isopropyl alcohol", "Fine sandpaper"],
    parts: ["Brake pads (if worn or hardened)"],
    safetyNotes: [
      "A pad set too high will cut through the tyre sidewall and can cause a blowout. A pad set too low can dive under the rim into the spokes.",
      "Every brake job must be checked by a second mechanic before QA.",
    ],
    steps: [
      {
        title: "Clean rims and pads",
        body: "Wipe the rim braking track with isopropyl alcohol. Lightly sand glazed pads and pick out embedded metal or grit. Hard, cracked old pads squeal no matter how they are adjusted; replace them.",
      },
      {
        title: "Loosen the pad bolt",
        body: "Loosen the 5mm pad fixing bolt just enough that the pad can move with firm hand pressure.",
      },
      {
        title: "Set height and angle",
        body: "Position the pad so the whole pad face sits on the braking track, about 1mm below the top edge of the rim, with the pad parallel to the rim's curve.",
      },
      {
        title: "Set toe-in",
        body: "Place a folded business card or rubber band between the trailing (rear) end of the pad and the rim. Squeeze the lever so the leading edge touches the rim first, about 1mm ahead of the trailing edge, then tighten the pad bolt while holding the lever.",
        caution: "Hold the pad so it doesn't rotate as you tighten the bolt; re-check the alignment afterwards.",
      },
      {
        title: "Repeat on the other side",
        body: "Do the same on the opposite pad, then centre the caliper using the centring screw or by rotating the caliper at its mounting bolt.",
      },
      {
        title: "Reset cable tension",
        body: "Pad adjustments change the lever feel. Re-check and adjust tension at the barrel adjuster.",
      },
    ],
    verify: [
      "Pads contact the rim leading edge first and sit fully on the braking track",
      "Pads do not touch the tyre at any point of the wheel's rotation",
      "Brakes are quiet and strong on a test stop",
      "Second mechanic has checked and signed off the brakes",
    ],
  },
  {
    id: "disc-rotor-rub",
    title: "Fix disc brake rotor rub",
    category: "brakes",
    summary:
      "Re-centre a rubbing disc brake caliper and true a bent rotor.",
    difficulty: "medium",
    timeMinutes: 20,
    tools: ["5mm hex key (caliper bolts; some use T25 Torx)", "T25 Torx key (rotor bolts)", "Rotor truing fork", "Isopropyl alcohol", "Torque wrench", "White card or paper (to see the gap)"],
    parts: ["Replacement rotor (if warped beyond truing)", "Brake pads (if contaminated)"],
    safetyNotes: [
      "Rotors get hot enough to burn; let them cool before handling.",
      "Do not touch the rotor braking surface with bare fingers; skin oil contaminates pads.",
      "Every brake job must be checked by a second mechanic before QA.",
    ],
    steps: [
      {
        title: "Confirm the wheel is seated",
        body: "Rub often comes from a wheel not fully seated in the dropouts. Loosen and re-tighten the thru-axle or quick release with the bike on the ground.",
      },
      {
        title: "Find the rub",
        body: "Spin the wheel and listen. Constant rub suggests a misaligned caliper; a rhythmic once-per-revolution rub suggests a bent rotor. Hold a white card behind the caliper to see the pad gaps.",
      },
      {
        title: "Re-centre the caliper",
        body: "Loosen both caliper mounting bolts slightly so the caliper can move. Squeeze and hold the brake lever to centre the caliper on the rotor, then tighten the bolts alternately while still holding the lever. Torque to spec (typically 6-8 Nm).",
      },
      {
        title: "Fine adjust by eye",
        body: "If rub remains, loosen the bolts again and shift the caliper by hand while viewing the gap against the white card. Tighten alternately so the caliper doesn't twist.",
      },
      {
        title: "True the rotor",
        body: "Spin the wheel slowly and watch where the rotor touches the pad. Use a rotor truing fork to gently bend that section back in small increments.",
        caution: "A rotor that is badly warped, cracked or worn below its minimum thickness (often 1.5mm; stamped on the rotor) must be replaced.",
      },
      {
        title: "Check pistons (hydraulic)",
        body: "If one pad doesn't retract, the piston may be sticky. Remove the pads, gently push the pistons back, clean around them and re-test.",
      },
      {
        title: "Clean and bed in",
        body: "Wipe the rotor with isopropyl alcohol. If the pads were contaminated (squealing, no bite), replace them and bed them in.",
      },
    ],
    verify: [
      "Wheel spins freely with no rub",
      "Lever is firm and consistent",
      "Caliper and rotor bolts torqued to spec",
      "Second mechanic has checked and signed off the brakes",
    ],
  },
  {
    id: "wheel-truing",
    title: "True a wheel",
    category: "wheels",
    summary:
      "Correct lateral wobble and hop by adjusting spoke tension in small, balanced increments.",
    difficulty: "hard",
    timeMinutes: 45,
    tools: ["Truing stand (or the bike's brake pads/frame as a reference)", "Spoke wrench in the correct size", "Spoke tension meter (optional)", "Penetrating oil", "Dishing tool"],
    parts: ["Replacement spokes and nipples (matched length and gauge)"],
    safetyNotes: [
      "A wheel with a cracked rim, cracked spoke holes, or a severely bent (tacoed) rim is scrap; do not true it for shipping.",
      "Over-tensioning spokes can pull nipples through the rim. Work in quarter turns.",
    ],
    steps: [
      {
        title: "Inspect the wheel first",
        body: "Remove the tyre if needed and check the rim for cracks around spoke holes, dents, and worn braking surface (concave wall or wear indicator gone). Squeeze pairs of spokes to find loose or broken ones.",
        caution: "Replace broken spokes before truing. Rims with cracks are scrap.",
      },
      {
        title: "Mount and find the worst spot",
        body: "Put the wheel in the truing stand and bring the caliper in until it just touches the rim at the worst lateral wobble. Mark it.",
      },
      {
        title: "Correct lateral true",
        body: "Where the rim pulls to one side, tighten spokes going to the opposite hub flange and loosen spokes going to the same side, in quarter turns, working outward from the centre of the wobble.",
        caution: "Nipples tighten clockwise viewed from the tyre side, which looks anticlockwise when you are working from the hub side with a spoke wrench. Double-check direction before turning.",
      },
      {
        title: "Correct radial true (hop)",
        body: "For a high spot, tighten the spokes at that spot on both sides equally; for a low spot, loosen them. Fix major hop before fine lateral work.",
      },
      {
        title: "Even out tension",
        body: "Squeeze spokes all around the wheel or use a tension meter. Spokes on the same side should feel similar. Bring very loose spokes up gradually.",
      },
      {
        title: "Stress relieve",
        body: "Squeeze parallel spoke pairs firmly all around the wheel to settle them. Re-check true; adjust again if needed.",
      },
      {
        title: "Check dish",
        body: "Use a dishing tool, or flip the wheel in the stand: the rim should sit centred in the frame. Rear wheels are asymmetric; dish is set relative to the locknuts, not the flanges.",
      },
    ],
    verify: [
      "Lateral wobble under about 1mm (rim brakes must not rub)",
      "No noticeable hop when spun",
      "No loose spokes; tension roughly even per side",
      "Wheel sits centred in the frame",
    ],
  },
  {
    id: "flat-tire-repair",
    title: "Repair a flat tyre",
    category: "wheels",
    summary:
      "Find the cause of a flat, patch or replace the tube, and seat the tyre correctly.",
    difficulty: "easy",
    timeMinutes: 15,
    tools: ["Tyre levers (2-3, plastic)", "Floor pump with pressure gauge", "Presta/Schrader valve adapter", "15mm wrench (bolt-on axles)", "Bucket of water (for finding slow leaks)"],
    parts: ["Inner tube of the correct size and valve type", "Patch kit (glue patches or self-adhesive)", "Rim tape (if damaged)"],
    safetyNotes: [
      "Always find and remove the cause of a puncture before fitting a new tube, or it will puncture again.",
      "Don't exceed the maximum pressure printed on the tyre sidewall.",
    ],
    steps: [
      {
        title: "Remove the wheel",
        body: "Release the rim brake (or note the disc caliper), shift to the smallest cog for rear wheels, and remove the wheel. Fully deflate the tube.",
      },
      {
        title: "Remove the tyre and tube",
        body: "Push both tyre beads into the rim centre channel, then lever one bead off with two tyre levers opposite the valve. Pull the tube out, valve last.",
      },
      {
        title: "Find the cause",
        body: "Inflate the tube and listen or dunk it in water to find the hole. Line the tube up with the tyre to locate the same spot. Run fingers carefully inside the tyre to find thorns, glass or wire. Check the rim tape covers every spoke hole.",
        caution: "Feel the inside of the tyre slowly; glass and wire can cut fingers.",
      },
      {
        title: "Diagnose the type of flat",
        body: "A single hole on the tread side means debris. Two parallel slits (snakebite) mean pinch flat from low pressure. A hole on the rim side means rim tape or spoke hole problem. A split at the valve means the tube shifted or the valve was damaged.",
      },
      {
        title: "Patch or replace the tube",
        body: "Rough up the area, apply glue and wait until it goes tacky, then press on the patch firmly. Old, perished, or multiply-patched tubes should be replaced.",
      },
      {
        title: "Refit the tyre",
        body: "Put a little air in the tube to give it shape, insert the valve, tuck the tube in, and roll the bead on by hand, finishing at the valve. Avoid levers for the final section if possible to prevent pinching.",
      },
      {
        title: "Inflate and seat",
        body: "Inflate to about 1 bar, check the tube isn't caught under the bead, and check the bead line is even all around both sides. Then inflate to the pressure on the sidewall.",
      },
    ],
    verify: [
      "Tyre holds pressure overnight (or for a set time before QA)",
      "Bead line even all around; no bulges",
      "Valve straight and valve nut/cap fitted",
      "Wheel reinstalled securely and brakes re-engaged",
    ],
  },
  {
    id: "hub-bearing-check",
    title: "Check and adjust hub bearings",
    category: "wheels",
    summary:
      "Detect play or grinding in cup-and-cone hubs and adjust or service them with cone wrenches.",
    difficulty: "hard",
    timeMinutes: 40,
    tools: ["Cone wrenches (13-17mm)", "Open-end wrenches (17mm locknut)", "Freewheel or cassette removal tool and chain whip (rear drive side)", "Grease", "Degreaser and rag", "Magnet or pick (for loose balls)"],
    parts: ["Loose ball bearings (commonly 3/16 inch front, 1/4 inch rear)", "Cones (if pitted)", "Cartridge bearings (sealed hubs)"],
    safetyNotes: [
      "A hub that is too tight wears quickly and can seize; too loose and the wheel can shift in the frame and rub the brakes.",
      "Pitted hub cups usually mean the hub (or wheel) is scrap for a refurbishment shop.",
    ],
    steps: [
      {
        title: "Test for play and roughness",
        body: "With the wheel in the bike, rock the rim side to side: any knock means play. Remove the wheel and turn the axle between your fingers: it should feel smooth, not gritty or notchy.",
      },
      {
        title: "Identify hub type",
        body: "Cup-and-cone hubs have cone flats visible between the locknut and the hub shell. Sealed cartridge hubs usually have no cone flats; worn cartridge bearings are replaced, not adjusted.",
      },
      {
        title: "Adjust the cones",
        body: "Hold the cone with a cone wrench and loosen the locknut on one side (non-drive side for rear hubs). Turn the cone by hand until play just disappears, then hold the cone and tighten the locknut against it.",
        caution: "Locking the nut usually tightens the adjustment slightly. Aim for a tiny bit of play before locking on quick-release hubs; clamping the QR removes it.",
      },
      {
        title: "Overhaul if gritty",
        body: "If the hub feels rough, remove the locknut and cone from one side, pull the axle, and remove all the balls. Clean the cups, cones and balls with degreaser and inspect for pitting.",
      },
      {
        title: "Reassemble",
        body: "Pack the cups with fresh grease, seat the balls (new balls are cheap; replace them), insert the axle and thread the cone and locknut back on. Adjust as above.",
      },
      {
        title: "Final check in the frame",
        body: "Refit the wheel and close the quick release or axle nuts. Check again for play at the rim and smooth rotation.",
      },
    ],
    verify: [
      "No side-to-side play at the rim with the wheel clamped in the frame",
      "Axle turns smoothly with no grinding or notchiness",
      "Locknuts tight against the cones on both sides",
    ],
  },
  {
    id: "bottom-bracket-check",
    title: "Check a bottom bracket",
    category: "other",
    summary:
      "Diagnose crank play and creaking from the bottom bracket, and remove, clean or replace it with the correct BB tool.",
    difficulty: "hard",
    timeMinutes: 45,
    tools: ["Crank puller (square taper / ISIS) or 8mm/10mm hex key (self-extracting cranks)", "BB tool matching the bracket (e.g. Shimano splined cartridge, external cup wrench)", "Large adjustable wrench or breaker bar", "Torque wrench", "Grease or anti-seize"],
    parts: ["Replacement bottom bracket (shell width, thread standard and spindle length must match)", "Crank bolts"],
    safetyNotes: [
      "Check thread direction before applying force. English (BSA) drive-side cups are left-hand threaded (tighten anticlockwise); Italian is right-hand on both sides.",
      "A crank that has worked loose on a square taper can be permanently damaged; check crank bolts on every bike.",
    ],
    steps: [
      {
        title: "Rule out the simple causes",
        body: "Creaks during pedalling are often pedals, crank bolts, chainring bolts, or a dry seatpost/saddle. Tighten crank bolts, remove and grease pedals, and check chainring bolts before removing the BB.",
      },
      {
        title: "Test for play",
        body: "Hold both crank arms and push them sideways toward and away from the frame. A knock means play. Remove the chain from the chainring and spin the cranks: they should turn smoothly without grinding.",
        caution: "Make sure the knock isn't the crank arm itself loose on the spindle; tighten the crank bolt and re-test.",
      },
      {
        title: "Remove the cranks",
        body: "Square taper/ISIS: remove the crank bolt and use a crank puller, threading it in fully before driving the puller. Hollowtech-style cranks: loosen the pinch bolts and remove the preload cap.",
      },
      {
        title: "Identify and remove the BB",
        body: "Identify the shell standard (English/BSA 68 or 73mm, Italian, press-fit) and the BB type. Remove the non-drive cup first with the matching BB tool, keeping the tool fully engaged.",
      },
      {
        title: "Inspect and clean the shell",
        body: "Clean the threads and inspect the shell for cracks. Cartridge bottom brackets with grinding or play are replaced, not serviced.",
      },
      {
        title: "Install",
        body: "Grease the threads (or use anti-seize). Thread the cups in by hand first, drive side then non-drive, and torque to the manufacturer spec (typically 35-50 Nm).",
      },
      {
        title: "Refit cranks",
        body: "Refit the cranks and torque the crank bolts to spec. Spin to check for smooth rotation and re-test for play.",
      },
    ],
    verify: [
      "No lateral play at the cranks",
      "Cranks spin smoothly with the chain off",
      "Crank bolts torqued; no creak on a hard test ride",
    ],
  },
  {
    id: "headset-adjustment",
    title: "Check and adjust a headset",
    category: "other",
    summary:
      "Find and remove headset play (knocking under braking) or tightness (notchy steering), and adjust threadless or threaded headsets.",
    difficulty: "medium",
    timeMinutes: 20,
    tools: ["4mm and 5mm hex keys", "Headset wrenches (32mm / 36mm, threaded headsets)", "Torque wrench", "Grease"],
    parts: ["Replacement headset bearings (matched to the headset standard)", "Star nut or expansion plug"],
    safetyNotes: [
      "Stem steerer bolts are critical: torque them to the stem's spec. Too loose and the bars can turn independently of the wheel; too tight can crack a carbon steerer.",
      "A notched (indexed) headset that catches in the straight-ahead position should be replaced; it affects steering control.",
    ],
    steps: [
      {
        title: "Test for play",
        body: "Hold the front brake on and rock the bike forward and back with a hand wrapped around the upper headset cup. A knock or clunk means the headset is loose.",
        caution: "Rule out a loose brake caliper, loose disc rotor or worn suspension fork bushings, which can feel the same.",
      },
      {
        title: "Test for binding and indexing",
        body: "Lift the front wheel and turn the bars slowly through their range. Steering should be smooth with no catching. A notch in the straight-ahead position means pitted races.",
      },
      {
        title: "Threadless: loosen the stem",
        body: "Loosen the stem's side pinch bolts (usually 4mm or 5mm) so the stem can slide on the steerer.",
      },
      {
        title: "Threadless: set preload",
        body: "Tighten the top cap bolt in small increments until play disappears but the bars still turn freely. The top cap only sets preload; it does not hold anything in place.",
        caution: "There must be a 2-5mm gap between the top of the steerer and the top of the stem/spacer stack, or the top cap can't preload the bearings.",
      },
      {
        title: "Threadless: align and tighten the stem",
        body: "Align the stem with the front wheel and tighten the pinch bolts alternately to the stem's spec (typically 5-6 Nm).",
      },
      {
        title: "Threaded headsets",
        body: "Hold the adjustable cup with one headset wrench and loosen the locknut with another. Adjust the cup until play just disappears, then hold the cup and tighten the locknut against it. Re-check: locking often changes the adjustment slightly.",
      },
      {
        title: "Re-test",
        body: "Repeat the brake-rock test and the steering test. If it can't be adjusted free of both play and binding, the bearings need replacing.",
      },
    ],
    verify: [
      "No knock when rocking the bike with the front brake on",
      "Bars turn smoothly through full range with no notch",
      "Stem aligned with the wheel and bolts torqued to spec",
    ],
  },
  {
    id: "frame-crack-inspection",
    title: "Inspect a frame and fork for cracks",
    category: "frame",
    summary:
      "Systematically inspect a donated frame and fork for cracks, dents and bends at the high-stress areas, and decide whether it is safe to refurbish.",
    difficulty: "medium",
    timeMinutes: 15,
    tools: ["Bright torch or headlamp", "Degreaser and rag", "Magnifying glass", "Coin (carbon tap test)", "Frame alignment gauge or string (optional)"],
    parts: [],
    safetyNotes: [
      "Never ship a bike with a cracked frame or fork. A crack will grow and fail without warning.",
      "Suspected damage on a carbon frame or fork means retire it or refer it to a specialist; volunteers should not try to judge carbon repairs.",
      "Do not attempt to weld, braze or glue a cracked frame in the workshop.",
    ],
    steps: [
      {
        title: "Clean the frame",
        body: "Wipe the frame and fork with degreaser. Cracks hide under dirt and grease, and a clean frame makes paint wrinkles and rust lines visible.",
      },
      {
        title: "Head tube and down tube junction",
        body: "Inspect the welds and lugs where the top tube and down tube meet the head tube, especially underneath the down tube. This is the most common crack site after a frontal impact. Look for rippled paint behind the head tube (a sign the frame has been bent).",
      },
      {
        title: "Bottom bracket shell",
        body: "Inspect around the BB shell, where the down tube, seat tube and chainstays join. Look for hairline cracks in the paint that follow the weld.",
      },
      {
        title: "Chainstays, seatstays and dropouts",
        body: "Check the chainstays near the BB and near the dropouts, the seatstay bridges, and the dropouts themselves (cracks often start at the derailleur hanger or rack mount eyelets).",
      },
      {
        title: "Seat cluster",
        body: "Inspect where the seat tube, top tube and seatstays meet, and the seat tube slot around the seat clamp. Remove the seatpost to look for cracks running down from the slot.",
      },
      {
        title: "Fork",
        body: "Check the fork crown, the blades, and the dropouts. Look along the fork from the side: blades bent backwards suggest a frontal impact. Check the steerer if the fork is removed.",
      },
      {
        title: "Dents and alignment",
        body: "Run fingers along each tube for dents. Small dents in steel tubes away from joints can be acceptable; dents in aluminium or near joints are a reject. Check that the rear wheel sits centred between the chainstays.",
      },
      {
        title: "Confirm suspected cracks",
        body: "Flex the frame (press the pedals against the brakes, push on the saddle) while watching the suspected area; a crack will open and close or the paint line will move. For carbon, a coin tap that sounds dull rather than sharp means possible delamination.",
        caution: "If in doubt, tag the frame as rejected. Ask a senior mechanic for a second opinion; never ship a questionable frame.",
      },
    ],
    verify: [
      "All high-stress areas inspected and recorded: head tube junction, BB shell, chainstays/dropouts, seat cluster, fork",
      "Frame passed, or tagged for scrap/parts with the reason noted",
      "Carbon damage referred out, not repaired",
    ],
  },
];
