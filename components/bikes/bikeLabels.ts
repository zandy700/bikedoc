import type { BikeType } from "@/lib/types";

export const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: "Road",
  mountain: "Mountain",
  hybrid: "Hybrid",
  city: "City",
  kids: "Kids",
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}
