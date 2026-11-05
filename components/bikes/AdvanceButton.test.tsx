import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Bike } from "@/lib/types";
import { AdvanceButton } from "./AdvanceButton";

function bike(overrides: Partial<Bike> = {}): Bike {
  return {
    id: "BK-0001",
    label: "Steel hybrid, 7-speed",
    type: "hybrid",
    size: "M",
    color: "Green",
    intakeDate: "2026-01-10",
    stage: "repair",
    faults: ["brakes"],
    notes: "",
    shipmentId: null,
    history: [{ at: "2026-01-10T09:00:00.000Z", stage: "intake", note: "Received" }],
    ...overrides,
  };
}

describe("AdvanceButton", () => {
  it("names the next stage and calls onAdvance with id and note", async () => {
    const onAdvance = vi.fn();
    render(<AdvanceButton bike={bike()} onAdvance={onAdvance} note="pads fitted" />);
    await userEvent.click(screen.getByRole("button", { name: /Move to QA/ }));
    expect(onAdvance).toHaveBeenCalledWith("BK-0001", "pads fitted");
  });

  it("is disabled and explains why when QA bike has no shipment", () => {
    render(<AdvanceButton bike={bike({ stage: "qa" })} onAdvance={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /Advance/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAccessibleDescription(/Assign the bike to a shipment/);
  });

  it("allows shipping once a shipment is assigned", () => {
    render(<AdvanceButton bike={bike({ stage: "qa", shipmentId: "SH-1" })} onAdvance={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Move to Shipped/ })).toBeEnabled();
  });

  it("shows a terminal message for shipped bikes", () => {
    render(<AdvanceButton bike={bike({ stage: "shipped", shipmentId: "SH-1" })} onAdvance={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText(/Shipped\. No further stages/)).toBeInTheDocument();
  });

  it("shows the error if the store rejects the move", async () => {
    const onAdvance = vi.fn(() => {
      throw new Error("Nope.");
    });
    render(<AdvanceButton bike={bike()} onAdvance={onAdvance} />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("alert")).toHaveTextContent("Nope.");
  });
});
