export function confidencePercent(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100);
}

export function confidenceWord(pct: number): string {
  if (pct >= 75) return "High";
  if (pct >= 45) return "Medium";
  return "Low";
}

export function ConfidenceMeter({ value, id }: { value: number; id?: string }) {
  const pct = confidencePercent(value);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-2" id={id ? `${id}-label` : undefined}>
        Confidence
      </span>
      <meter
        min={0}
        max={100}
        low={45}
        high={75}
        optimum={100}
        value={pct}
        aria-labelledby={id ? `${id}-label` : undefined}
        className="sr-only"
      >
        {pct}%
      </meter>
      <span aria-hidden="true" className="relative h-2 w-28 overflow-hidden rounded-full bg-accent-soft">
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-sm font-semibold">
        {pct}% <span className="font-normal text-ink-2">({confidenceWord(pct).toLowerCase()})</span>
      </span>
    </div>
  );
}
