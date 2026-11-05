"use client";

import { useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";

/** Two-step inline confirm, no modal: the action is destructive but local. */
export function ResetSampleData() {
  const { reset } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (!confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={() => {
            setDone(false);
            setConfirming(true);
          }}
        >
          Reset sample data
        </button>
        <p role="status" className="text-sm text-ink-2">
          {done ? "Sample data restored." : ""}
        </p>
      </div>
    );
  }

  return (
    <div role="group" aria-label="Confirm reset" className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold">Discard your changes and restore the sample bikes?</p>
      <button
        type="button"
        className="btn btn-sm btn-danger"
        autoFocus
        onClick={() => {
          reset();
          setConfirming(false);
          setDone(true);
        }}
      >
        Yes, reset
      </button>
      <button type="button" className="btn btn-sm" onClick={() => setConfirming(false)}>
        Keep my changes
      </button>
    </div>
  );
}
