import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StoreProvider } from "@/lib/store/StoreProvider";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s · BikeDoc",
    default: "BikeDoc — repair assistant for volunteer bike mechanics",
  },
  description:
    "Diagnose donated bikes from a photo and a description, follow step-by-step repair guides, and track bikes from intake to shipment.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1c211e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only-focusable fixed left-3 top-3 z-50 rounded-md bg-tag px-4 py-3 font-semibold text-tag-ink"
        >
          Skip to content
        </a>
        <StoreProvider>
          <SiteNav />
          <main id="main" tabIndex={-1} className="focus:outline-none mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10">
            {children}
          </main>
          <div className="pb-16 md:pb-0">
            <SiteFooter />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
