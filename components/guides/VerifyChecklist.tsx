"use client";

import { useId, useState } from "react";

/** Post-repair checklist. Ticks live only in component state; nothing is saved. */
export function VerifyChecklist({ items }: { items: string[] }) {
  const id = useId();
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const done = checked.filter(Boolean).length;

  return (
    <div>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={item}>
            <label
              htmlFor={`${id}-${i}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-bg-2"
            >
              <input
                id={`${id}-${i}`}
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                className="mt-1 size-5 shrink-0"
              />
              <span className={checked[i] ? "text-ink-2 line-through" : ""}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <p role="status" className="mt-2 text-sm font-semibold">
        {done === items.length && items.length > 0
          ? "All checks passed. The bike is ready for QA."
          : `${done} of ${items.length} checks done`}
      </p>
    </div>
  );
}
