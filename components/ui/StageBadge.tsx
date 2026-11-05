import { STAGES, STAGE_LABELS, type Stage } from "@/lib/types";

/** Stage label plus a 5-notch position gauge, so stage never relies on color. */
export function StageBadge({ stage }: { stage: Stage }) {
  const idx = STAGES.indexOf(stage);
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold">
      <span aria-hidden="true" className="flex gap-0.5">
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={`h-2.5 w-1.5 rounded-sm ${i <= idx ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </span>
      {STAGE_LABELS[stage]}
      <span className="sr-only">
        (stage {idx + 1} of {STAGES.length})
      </span>
    </span>
  );
}
