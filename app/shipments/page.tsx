import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShipmentsView } from "@/components/shipments/ShipmentsView";

export const metadata: Metadata = {
  title: "Shipments",
  description: "Batches of refurbished bikes, with how many are assigned and shipped.",
};

export default function ShipmentsPage() {
  return (
    <>
      <PageHeader title="Shipments">
        <p>Each batch fills up as bikes pass QA. All shipments here are sample data.</p>
      </PageHeader>
      <ShipmentsView />
    </>
  );
}
