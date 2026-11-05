"use client";

import Link from "next/link";
import { BIKE_TYPE_LABELS } from "./bikeLabels";
import type { Bike } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { AdvanceButton } from "./AdvanceButton";

export function BikeCard({ bike, onAdvance }: { bike: Bike; onAdvance: (id: string) => void }) {
  return (
    <article className="repair-tag flex flex-col gap-2 p-3 pl-7" aria-labelledby={`card-${bike.id}`}>
      <h3 id={`card-${bike.id}`} className="leading-tight">
        <Link href={`/bikes/${bike.id}`} className="font-sans hover:underline">
          <span className="block text-sm font-semibold text-ink-2">{bike.id}</span>
          <span className="block font-display text-xl font-bold">{bike.label}</span>
        </Link>
      </h3>
      <p className="text-sm text-ink-2">
        {BIKE_TYPE_LABELS[bike.type]}, {bike.size}, {bike.color}
      </p>
      {bike.faults.length ? (
        <ul className="flex flex-wrap gap-1" aria-label="Faults">
          {bike.faults.map((f) => (
            <li key={f}>
              <CategoryBadge category={f} />
            </li>
          ))}
        </ul>
      ) : null}
      <AdvanceButton bike={bike} onAdvance={onAdvance} compact />
    </article>
  );
}
