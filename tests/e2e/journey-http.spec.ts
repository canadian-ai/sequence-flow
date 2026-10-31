import { expect, test } from "@playwright/test"

test("HTTP slug loads a remote artifact with no customer-specific source", async ({ page }) => {
  await page.route("https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/v1/journeys/example", async (route) => {
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
      title:"Sample HTTP Journey",description:"Generic test artifact",
      slides:[{id:"begin",title:"Begin",chart:"sequenceDiagram\n  A->>B: Begin"}]
    })})
  })
  await page.goto("/journey?slug=example")
  await expect(page.getByRole("heading",{name:"Sample HTTP Journey"})).toBeVisible()
  await expect(page.getByText("Generic test artifact")).toBeVisible()
})

test("unknown slug returns a meaningful failure", async ({ page }) => {
  await page.route("https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/v1/journeys/unknown", async route => {
    await route.fulfill({status:404,body:"Not found"})
  })
  await page.goto("/journey?slug=unknown")
  await expect(page.getByText("Journey not found.")).toBeVisible()
})
