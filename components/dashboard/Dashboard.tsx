"use client";

import Link from "next/link";
import { useStore } from "@/lib/store/StoreProvider";
import { faultsByCategory, repairedOverTime, shipmentProgress, stageFunnel, summaryStats } from "@/lib/stats";
import { FaultsChart, FunnelChart, RepairedOverTimeChart, ShipmentChart } from "./Charts";

export function Dashboard() {
  const { state } = useStore();
  const stats = summaryStats(state);
  const tiles: { label: string; value: number; href: string; hint: string }[] = [
    { label: "Bikes on the books", value: stats.total, href: "/bikes", hint: "every bike since intake" },
    { label: "In the workshop", value: stats.inProgress, href: "/bikes", hint: "intake, diagnosis or repair" },
    { label: "Ready to ship", value: stats.readyToShip, href: "/shipments", hint: "passed QA" },
    { label: "Shipped", value: stats.shipped, href: "/shipments", hint: "on their way" },
  ];

  return (
    <>
      <section aria-labelledby="stats-h" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="stats-h" className="font-display text-3xl font-bold">
            Workshop at a glance
          </h2>
          <p className="text-sm text-ink-2">Sample data. Changes you make are saved in this browser.</p>
        </div>
        <dl className="panel mt-3 grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {tiles.map((t, i) => (
            <div
              key={t.label}
              className={`flex flex-col p-4 sm:p-5 ${i % 2 === 1 ? "border-l border-line lg:border-l-0" : ""} ${
                i >= 2 ? "border-t border-line lg:border-t-0" : ""
              }`}
            >
              <dt className="order-2 font-semibold">
                <Link href={t.href} className="hover:underline">
                  {t.label}
                </Link>
                <span className="block text-sm font-normal text-ink-2">{t.hint}</span>
              </dt>
              <dd className="order-1 font-display text-5xl font-bold leading-none tracking-tight">{t.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="charts-h" className="mt-10">
        <h2 id="charts-h" className="sr-only">
          Charts
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RepairedOverTimeChart data={repairedOverTime(state)} />
          <FaultsChart data={faultsByCategory(state)} />
          <ShipmentChart data={shipmentProgress(state)} />
          <FunnelChart data={stageFunnel(state)} />
        </div>
      </section>
    </>
  );
}
