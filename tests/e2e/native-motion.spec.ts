import { test, expect } from "@playwright/test"
import { createStandaloneJourneyHtml } from "../../components/ui/sequence-diagram/html-runtime"

const chart = "sequenceDiagram\n__proto__->>constructor: Request %% duration: 1000\nconstructor-->>__proto__: Reply %% duration: 1000\n__proto__->>__proto__: Self %% duration: 1000"

test("native particles follow forward, reverse and self paths at both viewport sizes", async ({ page }) => {
  await page.setContent(createStandaloneJourneyHtml([{ id: "one", chart }]))
  await page.locator("#play").click()
  await expect(page.locator("circle.dot-fly")).toHaveCount(3)
  for (const width of [1000, 390]) {
    await page.setViewportSize({ width, height: 800 })
    const distances = await page.evaluate(() => {
      const svg = document.querySelector("svg.edges") as SVGSVGElement
      svg.pauseAnimations()
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path.msg-line"))
      const circles = Array.from(svg.querySelectorAll<SVGCircleElement>("circle.dot-fly"))
      return circles.map((circle, i) => {
        const motion = circle.querySelector("animateMotion")!
        const start = Number.parseFloat(motion.getAttribute("begin")!) / 1000
        svg.setCurrentTime(start + 0.325)
        const actual = new DOMPoint(0, 0).matrixTransform(circle.getScreenCTM()!)
        const path = paths[i]
        const expected = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!)
        return Math.hypot(actual.x - expected.x, actual.y - expected.y)
      })
    })
    for (const distance of distances) expect(distance).toBeLessThan(2)
  }
})

test("reduced motion and hostile identifiers render safely", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.setContent(createStandaloneJourneyHtml([{ id: "one", chart: chart + "\n__proto__->>constructor: </script><img src=x onerror=alert(1)>" }]))
  await expect(page.locator(".msg-line")).toHaveCount(4)
  await expect(page.locator(".dot-fly")).toHaveCount(0)
  await expect(page.locator(".msg-label").last()).toContainText("<img")
  await expect(page.locator("img")).toHaveCount(0)
  expect(errors).toEqual([])
})
