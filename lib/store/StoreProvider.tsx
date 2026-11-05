"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createSeedState } from "@/lib/data/seed";
import {
  addBike as addBikeToState,
  addBikeNote,
  advanceBikeInState,
  assignShipment as assignShipmentInState,
  clearState,
  loadState,
  saveState,
  setBikeFaults,
  type NewBikeInput,
} from "@/lib/store/store";
import type { AppState, Bike, IssueCategory } from "@/lib/types";

export interface StoreValue {
  state: AppState;
  /** False during server render and hydration (state is the seed); true once localStorage has been read. */
  hydrated: boolean;
  addBike(input: NewBikeInput): Bike;
  /** Throws if the move is not allowed (e.g. no shipment assigned). */
  advance(id: string, note?: string): void;
  setFaults(id: string, faults: IssueCategory[]): void;
  assignShipment(id: string, shipmentId: string | null): void;
  addNote(id: string, note: string): void;
  reset(): void;
}

const StoreContext = createContext<StoreValue | null>(null);

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * External store per provider. Server render and hydration use the seed snapshot;
 * the client snapshot is read lazily from localStorage, so React re-renders with it
 * right after hydration without a mismatch.
 */
function createExternalStore() {
  const seed = createSeedState();
  let current: AppState | null = null;
  const listeners = new Set<() => void>();

  const getSnapshot = (): AppState => {
    if (current === null) current = loadState(browserStorage());
    return current;
  };
  const emit = () => listeners.forEach((l) => l());

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    getServerSnapshot: (): AppState => seed,
    update(fn: (s: AppState) => AppState) {
      const prev = getSnapshot();
      const next = fn(prev);
      if (next === prev) return;
      current = next;
      saveState(browserStorage(), next);
      emit();
    },
    reset() {
      clearState(browserStorage());
      current = createSeedState();
      emit();
    },
  };
}

const noopSubscribe = () => () => {};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createExternalStore);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const actions = useMemo(
    () => ({
      addBike(input: NewBikeInput): Bike {
        const result = addBikeToState(store.getSnapshot(), input, new Date());
        store.update(() => result.state);
        return result.bike;
      },
      advance(id: string, note?: string) {
        store.update((s) => advanceBikeInState(s, id, new Date(), note));
      },
      setFaults(id: string, faults: IssueCategory[]) {
        store.update((s) => setBikeFaults(s, id, faults));
      },
      assignShipment(id: string, shipmentId: string | null) {
        store.update((s) => assignShipmentInState(s, id, shipmentId));
      },
      addNote(id: string, note: string) {
        store.update((s) => addBikeNote(s, id, note, new Date()));
      },
      reset() {
        store.reset();
      },
    }),
    [store],
  );

  const value = useMemo<StoreValue>(() => ({ state, hydrated, ...actions }), [state, hydrated, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>.");
  return ctx;
}
