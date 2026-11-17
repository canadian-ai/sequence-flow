import { describe, expect, it } from "vitest"
import { createStandaloneJourneyHtml } from "../components/ui/sequence-diagram/html-runtime"

describe("standalone native journey", () => {
  it("uses SVG motion with the same path data as the edge", () => {
    const html = createStandaloneJourneyHtml([{id:"one",chart:"sequenceDiagram\nA->>B: Request\nB-->>A: Reply\nA->>A: Self"}])
    expect(html).toContain("createElementNS(NS,'animateMotion')")
    expect(html).toContain("motion.setAttribute('path',d)")
    expect(html).toContain("path.setAttribute('d',d)")
    expect(html).not.toContain("offsetPath:")
  })
  it("escapes script-breaking data and uses safe participant dictionaries", () => {
    const html = createStandaloneJourneyHtml([{id:"x",chart:"sequenceDiagram\n__proto__->>constructor: </script><script>alert(1)</script>"}])
    expect(html).not.toContain("<script>alert(1)</script>")
    expect(html).toContain("\\u003c/script")
    expect(html).toContain("Object.create(null)")
  })
  it("rejects empty and oversized charts", () => {
    expect(() => createStandaloneJourneyHtml([])).toThrow(RangeError)
    expect(() => createStandaloneJourneyHtml([{id:"x",chart:"x".repeat(25001)}])).toThrow(RangeError)
  })
})
