"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { NAV_ITEMS, isActive } from "./navItems";

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  return (
    <>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 font-display text-2xl font-bold tracking-tight no-underline"
          >
            <span className="grid size-8 place-items-center rounded-md bg-tag text-tag-ink">
              <Icon name="wrench" width={18} height={18} />
            </span>
            BikeDoc
          </Link>
          <nav aria-label="Main" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-2 rounded-md px-3 font-semibold no-underline transition-colors ${
                        active ? "bg-accent-soft text-ink" : "text-ink-2 hover:bg-bg-2 hover:text-ink"
                      }`}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <SampleBadge className="ml-auto md:ml-2" />
        </div>
      </header>

      {/* Bottom tab bar on small screens */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold no-underline ${
                    active ? "text-ink" : "text-ink-2"
                  }`}
                >
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full ${active ? "bg-accent-soft" : ""}`}
                  >
                    <Icon name={item.icon} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
