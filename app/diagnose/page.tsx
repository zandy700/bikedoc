import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { DiagnoseForm } from "@/components/diagnose/DiagnoseForm";

export const metadata: Metadata = {
  title: "Diagnose a bike",
  description: "Upload a photo and describe the symptoms to get likely faults and the repair guide for each.",
};

export default function DiagnosePage() {
  return (
    <>
      <PageHeader title="Diagnose a bike">
        <p>Snap the problem area and describe what you hear and feel. You&rsquo;ll get likely faults, most likely first, each with a repair guide.</p>
      </PageHeader>
      <DiagnoseForm />
    </>
  );
}
