"use client";

import { useId, useState } from "react";
import { canAdvance } from "@/lib/store/lifecycle";
import { STAGE_LABELS, type Bike } from "@/lib/types";

/**
 * Moves a bike one stage forward. When lifecycle rules block the move, the button is
 * disabled and the reason is shown next to it (and wired up as its description).
 */
export function AdvanceButton({
  bike,
  onAdvance,
  note,
  compact = false,
}: {
  bike: Bike;
  onAdvance: (id: string, note?: string) => void;
  note?: string;
  compact?: boolean;
}) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const check = canAdvance(bike);

  if (bike.stage === "shipped") {
    return <p className="text-sm text-ink-2">Shipped. No further stages.</p>;
  }

  const reason = check.ok ? null : check.reason;
  const label = check.ok ? `Move to ${STAGE_LABELS[check.to]}` : "Advance";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        className={`btn ${compact ? "btn-sm" : ""} ${check.ok ? "btn-primary" : ""}`}
        disabled={!check.ok}
        aria-describedby={reason || error ? `${id}-why` : undefined}
        onClick={() => {
          setError(null);
          try {
            onAdvance(bike.id, note);
          } catch (err) {
            setError(err instanceof Error ? err.message : "This bike can't move forward yet.");
          }
        }}
      >
        {label}
        <span className="sr-only"> ({bike.id})</span>
      </button>
      {reason || error ? (
        <p id={`${id}-why`} className="text-sm text-ink-2" role={error ? "alert" : undefined}>
          {error ?? reason}
        </p>
      ) : null}
    </div>
  );
}
