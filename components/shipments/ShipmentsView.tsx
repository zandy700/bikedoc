"use client";

import Link from "next/link";
import { useStore } from "@/lib/store/StoreProvider";
import { bikesInShipment } from "@/lib/store/store";
import type { ShipmentStatus } from "@/lib/types";
import { StageBadge } from "@/components/ui/StageBadge";
import { formatDate } from "@/components/bikes/bikeLabels";

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  planning: "Planning",
  packing: "Packing",
  shipped: "Shipped",
};

export function ShipmentsView() {
  const { state } = useStore();

  if (state.shipments.length === 0) {
    return <p className="text-ink-2">No shipments yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {state.shipments.map((s) => {
        const bikes = bikesInShipment(state, s.id);
        const shipped = bikes.filter((b) => b.stage === "shipped").length;
        const assigned = bikes.length;
        const cap = Math.max(s.capacity, assigned, 1);
        const pct = (n: number) => `${(n / cap) * 100}%`;
        const headingId = `ship-${s.id}`;
        return (
          <li key={s.id}>
            <section aria-labelledby={headingId} className="panel p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 id={headingId} className="font-display text-3xl font-bold">
                    {s.name}
                  </h2>
                  <p className="text-ink-2">
                    To {s.destination}. Target date {formatDate(s.targetDate)}.
                  </p>
                </div>
                <span className={`tag-chip self-start ${s.status === "shipped" ? "tag-chip-hivis" : ""}`}>
                  {STATUS_LABELS[s.status]}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm">
                  <span className="font-semibold">{shipped} shipped</span>,{" "}
                  <span className="font-semibold">{assigned} assigned</span> of {s.capacity} places
                </p>
                <div
                  role="img"
                  aria-label={`${shipped} shipped and ${assigned} assigned out of a capacity of ${s.capacity}`}
                  className="relative mt-2 h-4 overflow-hidden rounded-full bg-bg-2 ring-1 ring-line ring-inset"
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--series-2)]"
                    style={{ width: pct(assigned) }}
                  />
                  <span
                    className="absolute inset-y-0 left-0 rounded-full border-r-2 border-panel bg-[var(--series-1)]"
                    style={{ width: pct(shipped) }}
                  />
                </div>
                <ul className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-2" aria-hidden="true">
                  <li className="flex items-center gap-2">
                    <span className="size-3 rounded-sm bg-[var(--series-1)]" /> Shipped
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-3 rounded-sm bg-[var(--series-2)]" /> Assigned, not shipped
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-3 rounded-sm bg-bg-2 ring-1 ring-line" /> Open
                  </li>
                </ul>
              </div>

              <details className="mt-4" open={assigned > 0 && assigned <= 12}>
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold">
                  {assigned} assigned {assigned === 1 ? "bike" : "bikes"}
                </summary>
                {assigned === 0 ? (
                  <p className="text-ink-2">
                    No bikes yet. Assign bikes from their{" "}
                    <Link href="/bikes" className="underline">
                      detail page
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
                    {bikes.map((b) => (
                      <li key={b.id} className="border-t border-line">
                        <Link
                          href={`/bikes/${b.id}`}
                          className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 no-underline hover:bg-bg-2"
                        >
                          <span>
                            <span className="font-semibold underline">{b.id}</span>{" "}
                            <span className="text-ink-2">{b.label}</span>
                          </span>
                          <StageBadge stage={b.stage} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            </section>
          </li>
        );
      })}
    </ul>
  );
}
