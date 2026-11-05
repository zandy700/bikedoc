import { ResetSampleData } from "./ResetSampleData";
import { SampleBadge } from "@/components/ui/SampleBadge";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-panel">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-prose text-sm text-ink-2">
          <p className="flex flex-wrap items-center gap-2">
            <SampleBadge />
            <span>
              Bikes, shipments and charts are sample data, stored only in this browser.
            </span>
          </p>
          <p className="mt-2">
            Repair guides are general advice. When in doubt about a brake or a cracked frame, ask a senior mechanic.
          </p>
        </div>
        <ResetSampleData />
      </div>
    </footer>
  );
}
