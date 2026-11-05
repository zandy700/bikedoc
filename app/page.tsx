import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Impact dashboard",
};

export default function HomePage() {
  return (
    <>
      <section
        aria-labelledby="hero-h"
        className="pegboard -mx-4 -mt-6 border-b border-line px-4 pb-10 pt-10 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-0 lg:rounded-2xl lg:border lg:px-10"
      >
        <div className="max-w-3xl">
          <h1 id="hero-h" className="font-display text-5xl font-bold leading-[0.95] sm:text-7xl">
            Get donated bikes rolling again.
          </h1>
          <div className="mt-6 max-w-[62ch] rounded-xl bg-panel/90 p-4 text-lg sm:p-5">
            <p>
              BikeDoc was built by Xingjian Zhang after three years volunteering at WheelLab, refurbishing donated
              bikes. That work supported 750 bikes shipped to Zanzibar.
            </p>
            <p className="mt-2 text-base text-ink-2">
              It helps volunteer mechanics diagnose faults, follow repair guides, and track each bike to its
              shipment. The workshop numbers below are sample data so you can try it out.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/diagnose" className="btn btn-primary no-underline">
              Diagnose a bike
            </Link>
            <Link href="/bikes" className="btn no-underline">
              Open the bike board
            </Link>
          </div>
        </div>
      </section>
      <Dashboard />
    </>
  );
}
