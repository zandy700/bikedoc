import type { IconName } from "@/components/ui/Icon";

export const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Dashboard", icon: "gauge" },
  { href: "/diagnose", label: "Diagnose", icon: "stethoscope" },
  { href: "/bikes", label: "Bikes", icon: "bike" },
  { href: "/shipments", label: "Shipments", icon: "crate" },
  { href: "/guides", label: "Guides", icon: "book" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
