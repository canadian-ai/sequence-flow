import { expect, test } from "@playwright/test"

function parseRgb(value: string) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) throw new Error(`Unsupported color: ${value}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const
}

function relativeLuminance([r, g, b]: readonly number[]) {
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(parseRgb(foreground)), relativeLuminance(parseRgb(background)))
  const darker = Math.min(relativeLuminance(parseRgb(foreground)), relativeLuminance(parseRgb(background)))
  return (lighter + 0.05) / (darker + 0.05)
}

test("landing page gives external developers a self-contained quick start", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "60-second quick start" })).toBeVisible()
  await expect(page.getByText("No account, backend, or hosted runtime is required.")).toBeVisible()
  await expect(page.getByText('import { SequenceDiagram } from "@/components/ui/sequence-diagram"')).toBeVisible()
  await expect(page.getByRole("link", { name: "Try the live editor" })).toHaveAttribute("href", "#live-editor")
})

test("journey editor supports markdown, json, and live themes", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("tab", { name: "Journey" }).click()

  const markdownButton = page.getByRole("button", { name: "markdown", exact: true })
  const jsonButton = page.getByRole("button", { name: "json", exact: true })
  await expect(markdownButton).toHaveAttribute("aria-pressed", "true")

  const textarea = page.getByLabel("Journey markdown source")
  await expect(textarea).toHaveValue(/# Progressive web architecture/)
  await expect(textarea).toHaveValue(/## Step 1 — Client and server/)
  await expect(textarea).toHaveValue(/## Step 4 — The full picture/)

  const forest = page.getByRole("button", { name: /Forest/ })
  await forest.click()
  await expect(forest).toHaveAttribute("aria-pressed", "true")

  await page.getByRole("button", { name: "dark", exact: true }).click()
  await expect(page.getByRole("button", { name: "dark", exact: true })).toHaveAttribute("aria-pressed", "true")

  await jsonButton.click()
  await expect(page.getByLabel("Journey json source")).toHaveValue(/"id": "client-server"/)
  await expect(page.getByLabel("Journey json source")).toHaveValue(/"id": "full-picture"/)
})

test("journey editor stays within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByRole("tab", { name: "Journey" }).click()
  await expect(page.getByRole("button", { name: "markdown", exact: true })).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})

test("journey captions remain readable when the host prefers dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByRole("tab", { name: "Journey" }).click()

  const caption = page.locator("[data-journey-live-caption]")
  await expect(caption).toBeVisible()

  const colors = await caption.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      foreground: style.color,
      background: style.backgroundColor,
    }
  })

  expect(contrastRatio(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5)
})
