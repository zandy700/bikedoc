#!/usr/bin/env node
/**
 * Capture README screenshots of a running BikeDoc instance.
 *
 * Usage:
 *   npm run build && npm run start   # in one terminal
 *   npm run screenshots              # in another
 *
 * Env:
 *   BASE_URL  Server to capture (default http://localhost:3000)
 *
 * Output: docs/screenshots/*.png
 * Requires Playwright's Chromium: `npx playwright install chromium`.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs", "screenshots");

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const SYMPTOMS = "Chain skips under load and the rear brake squeals and feels spongy";
const CHART_SETTLE_MS = 800;
const NAV_TIMEOUT_MS = 30_000;
const RESULT_TIMEOUT_MS = 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkServer() {
  try {
    const res = await fetch(BASE_URL, { redirect: "manual" });
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `Cannot reach ${BASE_URL} (${err instanceof Error ? err.message : err}).\n` +
        "Start the app first: npm run build && npm run start (or set BASE_URL).",
    );
  }
}

async function open(page, route) {
  const url = BASE_URL + route;
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });
  if (!res) throw new Error(`No response navigating to ${url}`);
  if (!res.ok()) throw new Error(`GET ${url} returned HTTP ${res.status()}`);
  await sleep(CHART_SETTLE_MS);
}

async function shoot(page, name, fullPage = true) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage });
  console.log(`  saved ${path.relative(ROOT, file)}`);
}

async function capture(page, route, name, fullPage = true) {
  console.log(`- ${name} <- ${route}`);
  await open(page, route);
  await shoot(page, name, fullPage);
}

async function captureDiagnose(page) {
  const name = "diagnose-demo.png";
  console.log(`- ${name} <- /diagnose`);
  await open(page, "/diagnose");

  let input = page.locator("textarea").filter({ visible: true }).first();
  if ((await input.count()) === 0) input = page.getByRole("textbox", { name: /symptom/i }).first();
  if ((await input.count()) === 0) {
    throw new Error("Could not find the symptom textarea on /diagnose (no label matching /symptom/i and no <textarea>).");
  }
  await input.fill(SYMPTOMS);

  const button = page.getByRole("button", { name: /diagnose/i }).first();
  if ((await button.count()) === 0) {
    throw new Error('Could not find a button matching /diagnose/i on /diagnose.');
  }
  await button.click();

  try {
    await Promise.any([
      page.getByText(/confidence/i).first().waitFor({ state: "visible", timeout: RESULT_TIMEOUT_MS }),
      page.locator('[data-testid="diagnosis-results"]').first().waitFor({ state: "visible", timeout: RESULT_TIMEOUT_MS }),
    ]);
  } catch {
    throw new Error(
      `Diagnosis results did not appear within ${RESULT_TIMEOUT_MS / 1000}s ` +
        '(waited for text /confidence/i or [data-testid="diagnosis-results"]).',
    );
  }
  await page.waitForLoadState("networkidle").catch(() => {});
  await sleep(CHART_SETTLE_MS);
  await shoot(page, name);
}

async function main() {
  await checkServer();
  await mkdir(OUT_DIR, { recursive: true });

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    throw new Error(
      `Failed to launch Chromium: ${err instanceof Error ? err.message : err}\n` +
        "Install it with: npx playwright install chromium",
    );
  }

  try {
    console.log(`Capturing ${BASE_URL} -> ${path.relative(ROOT, OUT_DIR)}`);

    const desktop = await browser.newContext({ ...DESKTOP, colorScheme: "light" });
    const page = await desktop.newPage();
    await capture(page, "/", "dashboard.png");
    await captureDiagnose(page);
    await capture(page, "/bikes", "bikes.png");
    await capture(page, "/shipments", "shipments.png");
    await capture(page, "/guides/index-rear-derailleur", "guide.png");
    await desktop.close();

    const mobile = await browser.newContext({ ...MOBILE, colorScheme: "light" });
    const mpage = await mobile.newPage();
    // Viewport-only: a full-page capture would paint the fixed bottom tab bar mid-page.
    await capture(mpage, "/", "mobile-dashboard.png", false);
    await mobile.close();

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`\nScreenshot capture failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
