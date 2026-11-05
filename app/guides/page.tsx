import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";
import { PageHeader } from "@/components/ui/PageHeader";
import { GuideList } from "@/components/guides/GuideList";

export const metadata: Metadata = {
  title: "Repair guides",
  description: "Step-by-step repair guides for the faults volunteer mechanics see most on donated bikes.",
};

export default function GuidesPage() {
  return (
    <>
      <PageHeader title="Repair guides">
        <p>Tools, parts, safety notes and a check at the end of every job. Filter by the part of the bike you&rsquo;re working on.</p>
      </PageHeader>
      <GuideList guides={GUIDES} />
    </>
  );
}
