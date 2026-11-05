"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { BIKE_TYPES, CATEGORY_LABELS, STAGES, STAGE_LABELS, type Bike, type BikeType } from "@/lib/types";
import { StageBadge } from "@/components/ui/StageBadge";
import { AddBikeForm } from "./AddBikeForm";
import { AdvanceButton } from "./AdvanceButton";
import { BikeCard } from "./BikeCard";
import { BIKE_TYPE_LABELS } from "./bikeLabels";

type View = "board" | "list";

function matches(b: Bike, q: string): boolean {
  if (!q) return true;
  return [b.id, b.label, b.color, b.size, b.notes].some((t) => t.toLowerCase().includes(q));
}

export function BikesView() {
  const { state, advance, addBike } = useStore();
  const id = useId();
  const [view, setView] = useState<View>("board");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<BikeType | "all">("all");
  const [adding, setAdding] = useState(false);
  const [announce, setAnnounce] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const shipmentNames = useMemo(() => new Map(state.shipments.map((s) => [s.id, s.name])), [state.shipments]);

  const bikes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.bikes.filter((b) => (type === "all" || b.type === type) && matches(b, q));
  }, [state.bikes, query, type]);

  function onAdvance(bikeId: string, note?: string) {
    const bike = state.bikes.find((b) => b.id === bikeId);
    advance(bikeId, note);
    if (bike) {
      const to = STAGES[STAGES.indexOf(bike.stage) + 1];
      if (to) setAnnounce(`${bikeId} moved to ${STAGE_LABELS[to]}.`);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-72">
            <label htmlFor={`${id}-q`} className="label">
              Search bikes
            </label>
            <input
              id={`${id}-q`}
              type="search"
              className="field"
              placeholder="ID, description or colour…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="sm:w-44">
            <label htmlFor={`${id}-type`} className="label">
              Type
            </label>
            <select
              id={`${id}-type`}
              className="field"
              value={type}
              onChange={(e) => setType(e.target.value as BikeType | "all")}
            >
              <option value="all">All types</option>
              {BIKE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BIKE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="View" className="inline-flex rounded-lg border border-line-strong bg-panel p-0.5">
            {(["board", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`min-h-10 rounded-md px-4 font-semibold ${
                  view === v ? "bg-ink text-panel" : "text-ink-2 hover:text-ink"
                }`}
              >
                {v === "board" ? "Board" : "List"}
              </button>
            ))}
          </div>
          <button
            ref={addBtnRef}
            type="button"
            className="btn btn-primary"
            aria-expanded={adding}
            aria-controls={`${id}-add`}
            onClick={() => setAdding((a) => !a)}
          >
            Add bike
          </button>
        </div>
      </div>

      <div id={`${id}-add`} className="mt-4" hidden={!adding}>
        {adding ? (
          <AddBikeForm
            onAdd={addBike}
            onDone={(bike) => {
              setAdding(false);
              if (bike) setAnnounce(`Added ${bike.id}, ${bike.label}, at Intake.`);
              addBtnRef.current?.focus();
            }}
          />
        ) : null}
      </div>

      <p role="status" className="mt-4 min-h-6 text-sm font-semibold">
        {announce}
      </p>
      <p className="text-sm text-ink-2">
        Showing {bikes.length} of {state.bikes.length} bikes.
      </p>

      {bikes.length === 0 ? (
        <div className="panel mt-3 p-6">
          <p className="font-semibold">No bikes match these filters.</p>
          <button
            type="button"
            className="btn btn-sm mt-3"
            onClick={() => {
              setQuery("");
              setType("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : view === "board" ? (
        <Board bikes={bikes} onAdvance={onAdvance} />
      ) : (
        <List bikes={bikes} onAdvance={onAdvance} shipmentNames={shipmentNames} />
      )}
    </div>
  );
}

function Board({ bikes, onAdvance }: { bikes: Bike[]; onAdvance: (id: string) => void }) {
  return (
    <div
      className="-mx-4 mt-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 [scroll-snap-type:x_mandatory] lg:mx-0 lg:px-0"
      tabIndex={0}
      role="region"
      aria-label="Bike board, scroll sideways for more stages"
    >
      <ol className="grid auto-cols-[minmax(16rem,85vw)] grid-flow-col gap-3 sm:auto-cols-[minmax(13rem,1fr)]">
        {STAGES.map((stage) => {
          const inStage = bikes.filter((b) => b.stage === stage);
          return (
            <li key={stage} className="flex min-w-0 flex-col rounded-xl bg-bg-2 p-2 [scroll-snap-align:start]">
              <h2 className="flex items-baseline justify-between px-2 py-1">
                <span className="font-display text-2xl font-bold">{STAGE_LABELS[stage]}</span>
                <span className="text-sm font-semibold text-ink-2">
                  {inStage.length} <span className="sr-only">bikes</span>
                </span>
              </h2>
              {inStage.length === 0 ? (
                <p className="px-2 py-3 text-sm text-ink-2">No bikes at this stage.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {inStage.map((b) => (
                    <li key={b.id}>
                      <BikeCard bike={b} onAdvance={onAdvance} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function List({
  bikes,
  onAdvance,
  shipmentNames,
}: {
  bikes: Bike[];
  onAdvance: (id: string) => void;
  shipmentNames: Map<string, string>;
}) {
  return (
    <div className="panel mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Bike list">
      <table className="w-full min-w-[52rem] border-collapse text-left">
        <caption className="sr-only">All bikes matching the filters</caption>
        <thead className="bg-bg-2 text-sm">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">ID</th>
            <th scope="col" className="px-3 py-2 font-semibold">Bike</th>
            <th scope="col" className="px-3 py-2 font-semibold">Stage</th>
            <th scope="col" className="px-3 py-2 font-semibold">Faults</th>
            <th scope="col" className="px-3 py-2 font-semibold">Shipment</th>
            <th scope="col" className="px-3 py-2 font-semibold">Next step</th>
          </tr>
        </thead>
        <tbody>
          {bikes.map((b) => (
            <tr key={b.id} className="border-t border-line align-top">
              <th scope="row" className="px-3 py-2 font-semibold whitespace-nowrap">
                <Link href={`/bikes/${b.id}`} className="inline-flex min-h-11 items-center underline">
                  {b.id}
                </Link>
              </th>
              <td className="px-3 py-2">
                <span className="block font-semibold">{b.label}</span>
                <span className="text-sm text-ink-2">
                  {BIKE_TYPE_LABELS[b.type]}, {b.size}, {b.color}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <StageBadge stage={b.stage} />
              </td>
              <td className="px-3 py-2 text-sm">
                {b.faults.length ? b.faults.map((f) => CATEGORY_LABELS[f]).join(", ") : <span className="text-ink-2">None recorded</span>}
              </td>
              <td className="px-3 py-2 text-sm">
                {b.shipmentId ? shipmentNames.get(b.shipmentId) ?? b.shipmentId : <span className="text-ink-2">Not assigned</span>}
              </td>
              <td className="px-3 py-2">
                <AdvanceButton bike={b} onAdvance={onAdvance} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
