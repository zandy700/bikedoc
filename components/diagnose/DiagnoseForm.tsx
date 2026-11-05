"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DiagnoseResponse, Diagnosis } from "@/lib/diagnosis/schema";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/diagnosis/schema";
import { useStore } from "@/lib/store/StoreProvider";
import { CATEGORY_LABELS, type IssueCategory } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { DemoBanner } from "./DemoBanner";
import { IssueCard } from "./IssueCard";
import { resizeImageFile } from "./resizeImage";

const EXAMPLES = [
  "Chain skips under load on the small rear cogs",
  "Brakes squeal and the lever pulls almost to the bar",
  "Front wheel wobbles side to side and rubs the pad",
  "Clicking from the cranks on every pedal stroke",
  "Rear tyre goes flat overnight",
];

type Mode = "ai" | "demo" | "unknown";
type Result = Extract<DiagnoseResponse, { ok: true }>;

export function DiagnoseForm() {
  const ids = useId();
  const [mode, setMode] = useState<Mode>("unknown");
  const [model, setModel] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/diagnose", { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { mode?: "ai" | "demo"; model?: string } | null) => {
        if (cancelled || !data?.mode) return;
        setMode(data.mode);
        setModel(data.model);
      })
      .catch(() => {
        /* Mode is also reported on each diagnosis response. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (result) resultsRef.current?.focus();
  }, [result]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFormError(null);
    if (!file) return;
    setImageBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setImage(dataUrl);
      setImageName(file.name);
    } catch (err) {
      setImage(null);
      setImageName("");
      setFormError(err instanceof Error ? err.message : "That photo could not be read. Try another one.");
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setImageBusy(false);
    }
  }

  function removeImage() {
    setImage(null);
    setImageName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function addExample(text: string) {
    setDescription((d) => (d.trim() ? `${d.trim()}. ${text}` : text).slice(0, MAX_DESCRIPTION_LENGTH));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!description.trim() && !image) {
      setFormError("Add a photo, a description of the problem, or both.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), ...(image ? { image } : {}) }),
      });
      const data = (await res.json().catch(() => null)) as DiagnoseResponse | null;
      if (!data) throw new Error(`The diagnosis service returned an unreadable response (HTTP ${res.status}). Try again.`);
      if (!data.ok) throw new Error(data.error);
      setMode(data.mode);
      setModel(data.model);
      setResult(data);
    } catch (err) {
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : "Could not reach the diagnosis service. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const remaining = MAX_DESCRIPTION_LENGTH - description.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex flex-col gap-4">
        {mode === "demo" ? <DemoBanner /> : null}
        {mode === "ai" && model ? (
          <p className="text-sm text-ink-2">
            AI diagnosis is on, using <span className="font-semibold text-ink">{model}</span>.
          </p>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="panel flex flex-col gap-5 p-4 sm:p-5" aria-busy={loading}>
          <div>
            <span className="label" id={`${ids}-photo`}>
              Photo of the problem <span className="font-normal text-ink-2">(optional)</span>
            </span>
            {image ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                <img
                  src={image}
                  alt={`Preview of ${imageName || "your photo"}`}
                  className="max-h-56 w-auto rounded-lg border border-line object-contain"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-ink-2 [overflow-wrap:anywhere]">{imageName}</p>
                  <button type="button" className="btn btn-sm" onClick={removeImage}>
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor={`${ids}-file`}
                className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong bg-bg-2 p-4 text-center hover:border-accent has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--focus)]"
              >
                <Icon name="camera" width={28} height={28} />
                <span className="font-semibold">{imageBusy ? "Preparing photo…" : "Take or choose a photo"}</span>
                <span className="text-sm text-ink-2">Resized to 1024 px before upload</span>
              </label>
            )}
            <input
              ref={fileRef}
              id={`${ids}-file`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              aria-labelledby={`${ids}-photo`}
              onChange={onFile}
              className="sr-only"
            />
          </div>

          <div>
            <label htmlFor={`${ids}-desc`} className="label">
              What&rsquo;s wrong with the bike?
            </label>
            <textarea
              id={`${ids}-desc`}
              name="description"
              rows={5}
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chain jumps when I pedal hard in the lower gears…"
              aria-describedby={`${ids}-desc-hint`}
              className="field resize-y"
            />
            <p id={`${ids}-desc-hint`} className="mt-1 text-sm text-ink-2">
              Sounds, when it happens, what you&rsquo;ve already checked. {remaining < 200 ? `${remaining} characters left.` : ""}
            </p>
            <div className="mt-3">
              <p className="text-sm font-semibold text-ink-2" id={`${ids}-ex`}>
                Add a common symptom
              </p>
              <ul aria-labelledby={`${ids}-ex`} className="mt-1 flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button
                      type="button"
                      onClick={() => addExample(ex)}
                      className="min-h-11 rounded-full border border-line-strong bg-panel px-3 py-1.5 text-left text-sm hover:bg-bg-2"
                    >
                      {ex}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 font-semibold text-danger">
              {formError}
            </p>
          ) : null}

          <div>
            <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading || imageBusy}>
              {loading ? "Diagnosing…" : "Diagnose bike"}
            </button>
          </div>
        </form>
      </div>

      <section aria-labelledby={`${ids}-res`} aria-busy={loading}>
        <p role="status" className="sr-only">
          {loading
            ? "Diagnosing…"
            : result
              ? `Diagnosis ready: ${result.diagnosis.issues.length} likely ${result.diagnosis.issues.length === 1 ? "issue" : "issues"}.`
              : ""}
        </p>
        <h2 id={`${ids}-res`} ref={resultsRef} tabIndex={-1} className="font-display text-3xl font-bold focus:outline-none">
          Likely issues
        </h2>
        {loading ? <ResultsSkeleton /> : null}
        {!loading && !result ? (
          <p className="mt-2 max-w-prose text-ink-2">
            Describe the problem or add a photo, then choose Diagnose bike. Each likely issue links to a step-by-step
            repair guide.
          </p>
        ) : null}
        {!loading && result ? <Results result={result} /> : null}
      </section>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-3 flex flex-col gap-3" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="repair-tag h-40 animate-pulse bg-bg-2" />
      ))}
    </div>
  );
}

function Results({ result }: { result: Result }) {
  const { diagnosis } = result;
  return (
    <div className="mt-3 flex flex-col gap-4">
      {result.notice ? (
        <p role="status" className="rounded-lg bg-warn-soft p-3 text-sm">
          {result.notice}
        </p>
      ) : null}
      {diagnosis.summary ? <p className="max-w-prose text-lg">{diagnosis.summary}</p> : null}
      {diagnosis.issues.length === 0 ? (
        <p className="max-w-prose text-ink-2">
          No specific fault matched. Add detail such as noises, when it happens, or which part moves, and try again.
        </p>
      ) : (
        <ol className="flex flex-col gap-3" aria-label="Issues, most likely first">
          {diagnosis.issues.map((issue, i) => (
            <li key={`${issue.category}-${issue.title}-${i}`}>
              <IssueCard issue={issue} index={i} />
            </li>
          ))}
        </ol>
      )}
      {diagnosis.issues.length > 0 ? <SaveFaults diagnosis={diagnosis} /> : null}
    </div>
  );
}

function SaveFaults({ diagnosis }: { diagnosis: Diagnosis }) {
  const { state, setFaults } = useStore();
  const id = useId();
  const [bikeId, setBikeId] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const categories = Array.from(new Set(diagnosis.issues.map((i) => i.category))) as IssueCategory[];
  const candidates = state.bikes.filter((b) => b.stage !== "shipped");

  function save(e: React.FormEvent) {
    e.preventDefault();
    const bike = state.bikes.find((b) => b.id === bikeId);
    if (!bike) return;
    const merged = Array.from(new Set([...bike.faults, ...categories]));
    setFaults(bike.id, merged);
    setSaved(`Saved ${categories.map((c) => CATEGORY_LABELS[c]).join(", ")} to ${bike.id}.`);
  }

  return (
    <form onSubmit={save} className="panel mt-2 flex flex-col gap-3 p-4">
      <h3 className="font-display text-xl font-bold">Save faults to a bike</h3>
      <p className="text-sm text-ink-2">
        Adds {categories.map((c) => CATEGORY_LABELS[c]).join(", ")} to the bike&rsquo;s fault list.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="grow">
          <label htmlFor={`${id}-bike`} className="label">
            Bike
          </label>
          <select
            id={`${id}-bike`}
            className="field"
            value={bikeId}
            onChange={(e) => {
              setBikeId(e.target.value);
              setSaved(null);
            }}
          >
            <option value="">Choose a bike…</option>
            {candidates.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id}: {b.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn" disabled={!bikeId}>
          Save faults
        </button>
      </div>
      <p role="status" className="text-sm font-semibold">
        {saved}
      </p>
    </form>
  );
}
