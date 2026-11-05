"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { CATEGORY_LABELS, ISSUE_CATEGORIES, type Guide, type IssueCategory } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { DIFFICULTY_LABELS, formatMinutes } from "./difficulty";

export function GuideList({ guides }: { guides: Guide[] }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IssueCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (!q) return true;
      return [g.title, g.summary, ...g.tools, ...g.parts].some((t) => t.toLowerCase().includes(q));
    });
  }, [guides, query, category]);

  const counts = useMemo(() => {
    const c = new Map<IssueCategory, number>();
    for (const g of guides) c.set(g.category, (c.get(g.category) ?? 0) + 1);
    return c;
  }, [guides]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <label htmlFor={`${id}-q`} className="label">
            Search guides
          </label>
          <input
            id={`${id}-q`}
            type="search"
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. derailleur, spoke key, pads…"
            autoComplete="off"
          />
        </div>
        <fieldset>
          <legend className="label">Category</legend>
          <div className="flex flex-wrap gap-2">
            {(["all", ...ISSUE_CATEGORIES] as const).map((c) => {
              const n = c === "all" ? guides.length : (counts.get(c) ?? 0);
              const checked = category === c;
              return (
                <label
                  key={c}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] ${
                    checked ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-panel hover:bg-bg-2"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-cat`}
                    value={c}
                    checked={checked}
                    onChange={() => setCategory(c)}
                    className="sr-only"
                  />
                  {c === "all" ? "All" : CATEGORY_LABELS[c]}
                  <span className={checked ? "" : "text-ink-2"}>{n}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <p role="status" className="mt-5 text-sm text-ink-2">
        {filtered.length === guides.length
          ? `${guides.length} guides`
          : `${filtered.length} of ${guides.length} guides`}
      </p>

      {filtered.length === 0 ? (
        <div className="panel mt-3 p-6">
          <p className="font-semibold">No guides match &ldquo;{query}&rdquo;.</p>
          <button
            type="button"
            className="btn btn-sm mt-3"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Clear search and filter
          </button>
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <li key={g.id}>
              <Link
                href={`/guides/${g.id}`}
                className="repair-tag flex h-full flex-col p-4 pl-7 no-underline transition-colors hover:border-line-strong hover:bg-bg-2"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={g.category} />
                  <span className="text-sm text-ink-2">
                    {DIFFICULTY_LABELS[g.difficulty]}, about {formatMinutes(g.timeMinutes)}
                  </span>
                </span>
                <span className="mt-2 font-display text-2xl font-bold leading-tight">{g.title}</span>
                <span className="mt-1 line-clamp-3 text-ink-2">{g.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
