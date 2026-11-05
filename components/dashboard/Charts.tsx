"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { faultsByCategory, repairedOverTime, shipmentProgress, stageFunnel } from "@/lib/stats";
import { ChartFrame, LegendKey } from "./ChartFrame";

const S1 = "var(--series-1)";
const S2 = "var(--series-2)";
const AXIS = { fill: "var(--ink-2)", fontSize: 13 };
const chartStyle = { width: "100%", height: "100%" };

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-sm shadow-[0_4px_14px_rgb(0_0_0/0.14)]">
      <p className="font-semibold">{label}</p>
      <ul>
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2 text-ink-2">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: p.color }} />
            {p.name}: <span className="font-semibold text-ink">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const tooltip = <Tooltip content={ChartTooltip} cursor={{ fill: "var(--grid)", stroke: "var(--line-strong)" }} isAnimationActive={false} />;

export function RepairedOverTimeChart({ data }: { data: ReturnType<typeof repairedOverTime> }) {
  const totalRepaired = data.reduce((s, d) => s + d.repaired, 0);
  const peak = data.reduce((a, b) => (b.repaired > a.repaired ? b : a), data[0] ?? { label: "", repaired: 0 });
  return (
    <ChartFrame
      title="Bikes repaired per month"
      summary={
        data.length
          ? `${totalRepaired} bikes reached QA over ${data.length} months; the busiest month was ${peak.label} with ${peak.repaired}. Intake is shown as a dashed line for comparison.`
          : "No repairs recorded yet."
      }
      legend={
        <LegendKey
          items={[
            { label: "Repaired (reached QA)", color: S1, shape: "line" },
            { label: "Intake (dashed)", color: S2, shape: "line" },
          ]}
        />
      }
      rows={data}
      columns={[
        { key: "label", label: "Month" },
        { key: "repaired", label: "Repaired", numeric: true },
        { key: "intake", label: "Intake", numeric: true },
      ]}
    >
      <LineChart data={data} responsive style={chartStyle} accessibilityLayer={false} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: "var(--line-strong)" }} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        {tooltip}
        <Line
          type="monotone"
          dataKey="intake"
          name="Intake"
          stroke={S2}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 5, stroke: "var(--panel)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="repaired"
          name="Repaired"
          stroke={S1}
          strokeWidth={2}
          dot={{ r: 4, fill: S1, stroke: "var(--panel)", strokeWidth: 2 }}
          activeDot={{ r: 6, stroke: "var(--panel)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartFrame>
  );
}

export function FaultsChart({ data }: { data: ReturnType<typeof faultsByCategory> }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  return (
    <ChartFrame
      title="Most common faults"
      summary={
        top && top.count > 0
          ? `${top.label} faults are the most common, found on ${top.count} bikes. Counts are bikes with at least one fault in each category.`
          : "No faults recorded yet."
      }
      rows={sorted}
      columns={[
        { key: "label", label: "Category" },
        { key: "count", label: "Bikes", numeric: true },
      ]}
    >
      <BarChart data={sorted} layout="vertical" responsive style={chartStyle} accessibilityLayer={false} margin={{ top: 0, right: 36, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--grid)" />
        <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" width={72} tick={AXIS} tickLine={false} axisLine={{ stroke: "var(--line-strong)" }} />
        {tooltip}
        <Bar dataKey="count" name="Bikes" fill={S1} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
          <LabelList dataKey="count" position="right" fill="var(--ink)" fontSize={13} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

export function ShipmentChart({ data }: { data: ReturnType<typeof shipmentProgress> }) {
  const rows = data.map((d) => ({
    name: d.name.replace(/\s*—\s*SAMPLE$/, ""),
    shipped: d.shipped,
    waiting: Math.max(0, d.assigned - d.shipped),
    open: Math.max(0, d.capacity - d.assigned),
    assigned: d.assigned,
    capacity: d.capacity,
  }));
  const shippedTotal = data.reduce((s, d) => s + d.shipped, 0);
  return (
    <ChartFrame
      title="Shipped per shipment"
      summary={`${shippedTotal} bikes shipped across ${data.length} sample shipments. Each bar is one batch's capacity: shipped, assigned but not yet shipped, and open space.`}
      legend={
        <LegendKey
          items={[
            { label: "Shipped", color: S1 },
            { label: "Assigned, not shipped", color: S2 },
            { label: "Open capacity", color: "var(--grid)" },
          ]}
        />
      }
      rows={rows}
      columns={[
        { key: "name", label: "Shipment" },
        { key: "shipped", label: "Shipped", numeric: true },
        { key: "assigned", label: "Assigned", numeric: true },
        { key: "capacity", label: "Capacity", numeric: true },
      ]}
    >
      <BarChart data={rows} layout="vertical" responsive style={chartStyle} accessibilityLayer={false} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
        <XAxis type="number" allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={110} tick={AXIS} tickLine={false} axisLine={false} />
        {tooltip}
        <Bar dataKey="shipped" name="Shipped" stackId="a" fill={S1} stroke="var(--panel)" strokeWidth={2} maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="waiting" name="Assigned, not shipped" stackId="a" fill={S2} stroke="var(--panel)" strokeWidth={2} maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="open" name="Open capacity" stackId="a" fill="var(--grid)" stroke="var(--panel)" strokeWidth={2} radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ChartFrame>
  );
}

export function FunnelChart({ data }: { data: ReturnType<typeof stageFunnel> }) {
  const first = data[0]?.count ?? 0;
  const last = data[data.length - 1];
  return (
    <ChartFrame
      title="How far bikes get"
      summary={
        first > 0 && last
          ? `Of ${first} bikes taken in, ${last.count} (${Math.round((last.count / first) * 100)}%) have reached ${last.label.toLowerCase()}. Each bar counts bikes at or past that stage.`
          : "No bikes yet."
      }
      rows={data}
      columns={[
        { key: "label", label: "Stage" },
        { key: "count", label: "Bikes at or past stage", numeric: true },
      ]}
    >
      <BarChart data={data} responsive style={chartStyle} accessibilityLayer={false} margin={{ top: 20, right: 4, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: "var(--line-strong)" }} />
        <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
        {tooltip}
        <Bar dataKey="count" name="Bikes" fill={S1} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
          <LabelList dataKey="count" position="top" fill="var(--ink)" fontSize={13} />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
