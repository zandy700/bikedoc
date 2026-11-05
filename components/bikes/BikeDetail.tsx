"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useStore } from "@/lib/store/StoreProvider";
import { CATEGORY_LABELS, ISSUE_CATEGORIES, STAGE_LABELS, STAGES, type Bike, type IssueCategory } from "@/lib/types";
import { StageBadge } from "@/components/ui/StageBadge";
import { AdvanceButton } from "./AdvanceButton";
import { BIKE_TYPE_LABELS, formatDate } from "./bikeLabels";

export function BikeDetail({ id }: { id: string }) {
  const { state, hydrated } = useStore();
  const bike = state.bikes.find((b) => b.id === id);

  if (!bike) {
    if (!hydrated) {
      return <p className="text-ink-2">Loading bike…</p>;
    }
    return (
      <div className="mx-auto max-w-prose py-8">
        <h1 className="font-display text-4xl font-bold">No bike with ID {id}</h1>
        <p className="mt-3 text-ink-2">
          It may have been removed when the sample data was reset, or the ID has a typo. Bikes are stored in this
          browser only.
        </p>
        <Link href="/bikes" className="btn btn-primary mt-6 no-underline">
          Back to all bikes
        </Link>
      </div>
    );
  }

  return <BikeDetailBody key={bike.id} bike={bike} />;
}

function BikeDetailBody({ bike }: { bike: Bike }) {
  const { state, advance } = useStore();
  const ids = useId();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const shipment = state.shipments.find((s) => s.id === bike.shipmentId);

  return (
    <div>
      <p>
        <Link href="/bikes" className="inline-flex min-h-11 items-center font-semibold text-ink-2 hover:text-ink">
          All bikes
        </Link>
      </p>
      <header className="mt-2 flex flex-col gap-3">
        <p className="text-lg font-semibold text-ink-2">{bike.id}</p>
        <h1 className="-mt-2 font-display text-4xl font-bold sm:text-5xl">{bike.label}</h1>
        <StageBadge stage={bike.stage} />
        <dl className="mt-1 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-5">
          <Fact label="Type" value={BIKE_TYPE_LABELS[bike.type]} />
          <Fact label="Size" value={bike.size} />
          <Fact label="Colour" value={bike.color} />
          <Fact label="Arrived" value={formatDate(bike.intakeDate)} />
          <Fact label="Shipment" value={shipment ? shipment.name : "Not assigned"} />
        </dl>
        {bike.notes ? <p className="max-w-prose text-ink-2">{bike.notes}</p> : null}
      </header>

      <p role="status" className="mt-4 min-h-6 font-semibold">
        {status}
      </p>

      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <section aria-labelledby={`${ids}-adv`} className="panel p-4 sm:p-5">
            <h2 id={`${ids}-adv`} className="font-display text-2xl font-bold">
              Move to the next stage
            </h2>
            {bike.stage !== "shipped" ? (
              <div className="mt-3">
                <label htmlFor={`${ids}-note`} className="label">
                  Note for the history <span className="font-normal text-ink-2">(optional)</span>
                </label>
                <input
                  id={`${ids}-note`}
                  className="field"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. New pads fitted, brakes tested…"
                />
              </div>
            ) : null}
            <div className="mt-3">
              <AdvanceButton
                bike={bike}
                note={note}
                onAdvance={(id, n) => {
                  const to = STAGES[STAGES.indexOf(bike.stage) + 1];
                  advance(id, n);
                  setNote("");
                  if (to) setStatus(`Moved to ${STAGE_LABELS[to]}.`);
                }}
              />
            </div>
          </section>

          <FaultsEditor key={bike.faults.join(",")} bike={bike} onSaved={setStatus} />
          <ShipmentEditor key={bike.shipmentId ?? "none"} bike={bike} onSaved={setStatus} />
          <NoteEditor bike={bike} onSaved={setStatus} />
        </div>

        <section aria-labelledby={`${ids}-hist`} className="panel p-4 sm:p-5">
          <h2 id={`${ids}-hist`} className="font-display text-2xl font-bold">
            History
          </h2>
          <ol className="mt-4">
            {bike.history.map((ev, i) => (
              <li key={`${ev.at}-${i}`} className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
                <span aria-hidden="true" className="relative flex justify-center">
                  <span className="z-10 mt-1.5 size-3 rounded-full border-2 border-panel bg-accent ring-1 ring-accent" />
                  {i < bike.history.length - 1 ? (
                    <span className="absolute top-4 bottom-[-1.25rem] w-px bg-line-strong" />
                  ) : null}
                </span>
                <div>
                  <p className="text-sm text-ink-2">
                    <time dateTime={ev.at}>{formatDate(ev.at)}</time>, {STAGE_LABELS[ev.stage]}
                  </p>
                  <p>{ev.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function FaultsEditor({ bike, onSaved }: { bike: Bike; onSaved: (s: string) => void }) {
  const { setFaults } = useStore();
  const ids = useId();
  const [selected, setSelected] = useState<IssueCategory[]>(bike.faults);
  const dirty =
    selected.length !== bike.faults.length || selected.some((c) => !bike.faults.includes(c));

  return (
    <form
      className="panel p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setFaults(bike.id, selected);
        onSaved(selected.length ? `Faults saved: ${selected.map((c) => CATEGORY_LABELS[c]).join(", ")}.` : "Faults cleared.");
      }}
    >
      <fieldset>
        <legend className="font-display text-2xl font-bold">Faults found</legend>
        <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3">
          {ISSUE_CATEGORIES.map((c) => (
            <label
              key={c}
              htmlFor={`${ids}-${c}`}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-bg-2"
            >
              <input
                id={`${ids}-${c}`}
                type="checkbox"
                className="size-5"
                checked={selected.includes(c)}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked ? ISSUE_CATEGORIES.filter((x) => x === c || s.includes(x)) : s.filter((x) => x !== c),
                  )
                }
              />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn mt-3" disabled={!dirty}>
        Save faults
      </button>
    </form>
  );
}

function ShipmentEditor({ bike, onSaved }: { bike: Bike; onSaved: (s: string) => void }) {
  const { state, assignShipment } = useStore();
  const ids = useId();
  const [value, setValue] = useState(bike.shipmentId ?? "");
  const locked = bike.stage === "shipped";

  return (
    <form
      className="panel p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        assignShipment(bike.id, value || null);
        const name = state.shipments.find((s) => s.id === value)?.name;
        onSaved(name ? `Assigned to ${name}.` : "Removed from its shipment.");
      }}
    >
      <h2 className="font-display text-2xl font-bold">Shipment</h2>
      {locked ? (
        <p className="mt-2 text-ink-2">This bike has shipped, so its shipment can&rsquo;t change.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grow">
            <label htmlFor={`${ids}-ship`} className="label">
              Assign to
            </label>
            <select id={`${ids}-ship`} className="field" value={value} onChange={(e) => setValue(e.target.value)}>
              <option value="">Not assigned</option>
              {state.shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn" disabled={value === (bike.shipmentId ?? "")}>
            Save shipment
          </button>
        </div>
      )}
    </form>
  );
}

function NoteEditor({ bike, onSaved }: { bike: Bike; onSaved: (s: string) => void }) {
  const { addNote } = useStore();
  const ids = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="panel p-4 sm:p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) {
          setError("Write a note before adding it.");
          return;
        }
        addNote(bike.id, text.trim());
        setText("");
        setError(null);
        onSaved("Note added to the history.");
      }}
    >
      <label htmlFor={`${ids}-n`} className="font-display text-2xl font-bold">
        Add a note
      </label>
      <textarea
        id={`${ids}-n`}
        className="field mt-3"
        rows={3}
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${ids}-err` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        placeholder="e.g. Waiting on a 26in inner tube…"
      />
      {error ? (
        <p id={`${ids}-err`} className="mt-1 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn mt-3">
        Add note
      </button>
    </form>
  );
}
