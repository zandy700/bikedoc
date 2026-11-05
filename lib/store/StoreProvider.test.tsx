import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { renderToString } from "react-dom/server";
import { createSeedState } from "@/lib/data/seed";
import { StoreProvider, useStore, type StoreValue } from "@/lib/store/StoreProvider";
import { addBike, STORAGE_KEY } from "@/lib/store/store";
import type { AppState } from "@/lib/types";

const handle: { current: StoreValue | null } = { current: null };
const api = new Proxy({} as StoreValue, { get: (_t, k) => handle.current![k as keyof StoreValue] });
const latest = () => handle.current!;

function Probe() {
  const store = useStore();
  useEffect(() => {
    handle.current = store;
  });
  return (
    <div>
      <span data-testid="count">{store.state.bikes.length}</span>
      <span data-testid="hydrated">{String(store.hydrated)}</span>
      <span data-testid="first-stage">{store.state.bikes[0].stage}</span>
    </div>
  );
}

const ui = () => (
  <StoreProvider>
    <Probe />
  </StoreProvider>
);

const seed = createSeedState();
const stored = (): AppState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AppState) : null;
};

beforeEach(() => localStorage.clear());

describe("StoreProvider", () => {
  it("renders the seed on the server even when localStorage has data", () => {
    const extra = addBike(seed, { label: "x", type: "road", size: "54cm", color: "Red" }, new Date()).state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
    const html = renderToString(ui());
    expect(html).toContain(`>${seed.bikes.length}<`);
    expect(html).toContain(">false<");
  });

  it("renders seed when storage is empty and does not write until a change", async () => {
    render(ui());
    expect(screen.getByTestId("count")).toHaveTextContent(String(seed.bikes.length));
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(stored()).toBeNull();
  });

  it("hydrates from localStorage", async () => {
    const extra = addBike(seed, { label: "x", type: "road", size: "54cm", color: "Red" }, new Date()).state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extra));
    render(ui());
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent(String(seed.bikes.length + 1)));
    expect(screen.getByTestId("hydrated")).toHaveTextContent("true");
  });

  it("falls back to seed on corrupt storage", async () => {
    localStorage.setItem(STORAGE_KEY, "{oops");
    render(ui());
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(screen.getByTestId("count")).toHaveTextContent(String(seed.bikes.length));
  });

  it("advance, addBike, notes, faults and shipment persist; reset restores seed", async () => {
    render(ui());
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    const intake = api.state.bikes.find((b) => b.stage === "intake")!;

    act(() => api.advance(intake.id, "looked at"));
    expect(stored()!.bikes.find((b) => b.id === intake.id)!.stage).toBe("diagnosis");

    act(() => api.setFaults(intake.id, ["chain"]));
    act(() => api.assignShipment(intake.id, "SH-LOC-1"));
    act(() => api.addNote(intake.id, "Chain replaced"));
    const saved = stored()!.bikes.find((b) => b.id === intake.id)!;
    expect(saved).toMatchObject({ faults: ["chain"], shipmentId: "SH-LOC-1" });
    expect(saved.history.at(-1)!.note).toBe("Chain replaced");

    let id = "";
    act(() => {
      id = api.addBike({ label: "Kids 16in with stabilisers", type: "kids", size: "16in wheel", color: "Pink" }).id;
    });
    expect(id).toBe(`BK-${String(seed.bikes.length + 1).padStart(4, "0")}`);
    expect(screen.getByTestId("count")).toHaveTextContent(String(seed.bikes.length + 1));

    expect(() => api.advance("BK-9999")).toThrow(/not found/);

    act(() => api.reset());
    expect(stored()).toBeNull();
    expect(screen.getByTestId("count")).toHaveTextContent(String(seed.bikes.length));
    expect(api.state).toEqual(seed);
  });

  it("keeps the context value stable across unrelated re-renders", async () => {
    const { rerender } = render(ui());
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    const before = latest();
    rerender(ui());
    expect(latest()).toBe(before);
  });

  it("useStore throws outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/StoreProvider/);
    spy.mockRestore();
  });
});
