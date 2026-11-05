import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "69b2fd9ad4a1cbc2f9769dd42dd5a9e4",
  worker: defineWorker({
    name: "bikedoc",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-05",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
