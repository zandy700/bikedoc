"use client";

import { useId, useRef, useState } from "react";
import { BIKE_TYPES, type Bike, type BikeType } from "@/lib/types";
import { BIKE_TYPE_LABELS } from "./bikeLabels";

interface Values {
  label: string;
  type: BikeType;
  size: string;
  color: string;
  notes: string;
}

type Errors = Partial<Record<keyof Values, string>>;

export function validateNewBike(v: Values): Errors {
  const e: Errors = {};
  if (!v.label.trim()) e.label = "Describe the bike, e.g. “Steel hybrid, 7-speed”.";
  else if (v.label.trim().length > 80) e.label = "Keep the description under 80 characters.";
  if (!v.size.trim()) e.size = "Enter a size, e.g. M, 54cm or 24in wheel.";
  if (!v.color.trim()) e.color = "Enter the main frame colour.";
  return e;
}

const EMPTY: Values = { label: "", type: "hybrid", size: "", color: "", notes: "" };

export function AddBikeForm({
  onAdd,
  onDone,
}: {
  onAdd: (v: { label: string; type: BikeType; size: string; color: string; notes?: string }) => Bike;
  onDone: (bike: Bike | null) => void;
}) {
  const id = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const refs = {
    label: useRef<HTMLInputElement>(null),
    size: useRef<HTMLInputElement>(null),
    color: useRef<HTMLInputElement>(null),
  };

  function set<K extends keyof Values>(k: K, v: Values[K]) {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateNewBike(values);
    setErrors(errs);
    const first = (["label", "size", "color"] as const).find((k) => errs[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    const bike = onAdd({
      label: values.label.trim(),
      type: values.type,
      size: values.size.trim(),
      color: values.color.trim(),
      notes: values.notes.trim() || undefined,
    });
    setValues(EMPTY);
    onDone(bike);
  }

  const field = (k: "label" | "size" | "color", label: string, placeholder: string) => (
    <div>
      <label htmlFor={`${id}-${k}`} className="label">
        {label}
      </label>
      <input
        ref={refs[k]}
        id={`${id}-${k}`}
        name={k}
        className="field"
        value={values[k]}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `${id}-${k}-err` : undefined}
        onChange={(e) => set(k, e.target.value)}
      />
      {errors[k] ? (
        <p id={`${id}-${k}-err`} className="mt-1 text-sm font-semibold text-danger">
          {errors[k]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="panel grid gap-4 p-4 sm:grid-cols-2 sm:p-5" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="font-display text-2xl font-bold sm:col-span-2">
        Add a donated bike
      </h2>
      <div className="sm:col-span-2">{field("label", "Description", "e.g. Steel hybrid, 7-speed…")}</div>
      <div>
        <label htmlFor={`${id}-type`} className="label">
          Type
        </label>
        <select
          id={`${id}-type`}
          className="field"
          value={values.type}
          onChange={(e) => set("type", e.target.value as BikeType)}
        >
          {BIKE_TYPES.map((t) => (
            <option key={t} value={t}>
              {BIKE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      {field("size", "Size", "e.g. M, 54cm, 24in wheel…")}
      {field("color", "Colour", "e.g. Dark green…")}
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-notes`} className="label">
          Intake notes <span className="font-normal text-ink-2">(optional)</span>
        </label>
        <textarea
          id={`${id}-notes`}
          className="field"
          rows={2}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Anything the next mechanic should know…"
        />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button type="submit" className="btn btn-primary">
          Add bike
        </button>
        <button type="button" className="btn" onClick={() => onDone(null)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
