import { useId } from "react";

export interface ChartColumn<Row> {
  key: keyof Row & string;
  label: string;
  numeric?: boolean;
}

/**
 * Accessible chart shell: a heading, a one-sentence takeaway that doubles as the
 * chart's accessible description, the plot itself (hidden from AT), and an
 * expandable data table with every value.
 */
export function ChartFrame<Row extends object>({
  title,
  summary,
  legend,
  rows,
  columns,
  children,
}: {
  title: string;
  summary: string;
  legend?: React.ReactNode;
  rows: Row[];
  columns: ChartColumn<Row>[];
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <figure className="panel flex flex-col p-4 sm:p-5" aria-labelledby={`${id}-t`} aria-describedby={`${id}-s`}>
      <h2 id={`${id}-t`} className="font-display text-2xl font-bold">
        {title}
      </h2>
      <p id={`${id}-s`} className="mt-1 text-sm text-ink-2">
        {summary}
      </p>
      {legend ? <div className="mt-3">{legend}</div> : null}
      <div className="mt-3 h-64" aria-hidden="true">
        {children}
      </div>
      <details className="mt-2 text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-ink-2 hover:text-ink">
          Show data table
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-line">
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={`py-1.5 pr-3 font-semibold ${c.numeric ? "text-right" : ""}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  {columns.map((c, ci) => {
                    const v = String((r as Record<string, unknown>)[c.key]);
                    return ci === 0 ? (
                      <th key={c.key} scope="row" className="py-1.5 pr-3 font-normal">
                        {v}
                      </th>
                    ) : (
                      <td key={c.key} className={`py-1.5 pr-3 ${c.numeric ? "text-right" : ""}`}>
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

export function LegendKey({ items }: { items: { label: string; color: string; shape?: "line" | "box" }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={it.shape === "line" ? "h-0.5 w-4 rounded" : "size-3 rounded-sm"}
            style={{ background: it.color }}
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
