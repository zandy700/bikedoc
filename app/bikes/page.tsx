import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { BikesView } from "@/components/bikes/BikesView";

export const metadata: Metadata = {
  title: "Bikes",
  description: "Every donated bike by stage, from intake to shipped.",
};

export default function BikesPage() {
  return (
    <>
      <PageHeader title="Bikes">
        <p>Each bike moves left to right: intake, diagnosis, repair, QA, shipped. A bike needs a shipment before it can be marked shipped.</p>
      </PageHeader>
      <BikesView />
    </>
  );
}
