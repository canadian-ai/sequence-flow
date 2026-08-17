import { defineConfig } from "@playwright/test"

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: isCI ? "pnpm start --hostname 127.0.0.1" : "pnpm dev --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
