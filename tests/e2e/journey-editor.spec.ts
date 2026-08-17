import { expect, test } from "@playwright/test"

test("journey editor supports markdown, json, and live themes", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("tab", { name: "Journey" }).click()

  const markdownButton = page.getByRole("button", { name: "markdown", exact: true })
  const jsonButton = page.getByRole("button", { name: "json", exact: true })
  await expect(markdownButton).toHaveAttribute("aria-pressed", "true")

  const textarea = page.getByLabel("Journey markdown source")
  await expect(textarea).toHaveValue(/# Request lifecycle/)

  const forest = page.getByRole("button", { name: /Forest/ })
  await forest.click()
  await expect(forest).toHaveAttribute("aria-pressed", "true")

  await page.getByRole("button", { name: "dark", exact: true }).click()
  await expect(page.getByRole("button", { name: "dark", exact: true })).toHaveAttribute("aria-pressed", "true")

  await jsonButton.click()
  await expect(page.getByLabel("Journey json source")).toHaveValue(/"id"/)
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
