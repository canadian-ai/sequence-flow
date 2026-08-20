import { describe, expect, it } from "vitest"

import { journeyCatalog } from "../components/demo/journey-catalog-data"
import { createStandaloneJourneyHtml, sanitizeJourneyFilename } from "../components/ui/sequence-diagram/html-runtime"

describe("standalone journey HTML", () => {
  it("serializes untrusted text as inert JSON", () => {
    const html = createStandaloneJourneyHtml([{ id: "x", title: "</script><script>alert(1)</script>", chart: "sequenceDiagram" }])
    expect(html).not.toContain("</script><script>alert(1)</script>")
    expect(html).toContain("\\u003c/script\\u003e")
  })

  it("creates portable controls and safe filenames", () => {
    const html = createStandaloneJourneyHtml(journeyCatalog[0].slides, { title: "Customer / Onboarding" })
    expect(html).toContain('id="journey-data"')
    expect(html).toContain('id="play"')
    expect(sanitizeJourneyFilename("Customer / Onboarding")).toBe("customer-onboarding.html")
  })
})

describe("journey catalog", () => {
  it("contains business and technical examples with copyable commands", () => {
    expect(journeyCatalog.length).toBeGreaterThanOrEqual(10)
    expect(new Set(journeyCatalog.map((item) => item.kind))).toEqual(new Set(["Business", "Technical"]))
    expect(journeyCatalog.every((item) => item.command && item.slides.length > 1)).toBe(true)
  })
})
