import { expect, test } from "@playwright/test"

test("journey editor publishes free expiring links and revokes them",async({page})=>{
  await page.route("https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/v1/journeys",route=>
    route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({
      url:"https://sequence-flow.canadian-ai.app/journey?slug=abcdef123456789012345678",
      slug:"abcdef123456789012345678",
      deleteToken:"a".repeat(64),
      expiresAt:"2030-01-01T00:00:00.000Z",
      expiresIn:"24h",
      free:true
    })})
  )
  await page.route("https://sequence-flow-journeys.icy-dream-7fdb.workers.dev/v1/journeys/abcdef123456789012345678",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({revoked:true,slug:"abcdef123456789012345678"})})
  )
  await page.goto("/#editor")
  await page.getByRole("tab",{name:"Journey"}).click()
  await page.getByLabel("Journey expiration").selectOption("24h")
  await page.getByRole("button",{name:"Publish free"}).click()
  await expect(page.getByText("Published snapshot")).toBeVisible()
  await expect(page.getByRole("link",{name:/slug=abcdef/})).toBeVisible()
  await page.getByRole("button",{name:"Revoke journey"}).click()
  await expect(page.getByText(/Journey revoked/)).toBeVisible()
})
