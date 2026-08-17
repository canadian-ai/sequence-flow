import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { journeySlidesFromMarkdown } from "../components/ui/sequence-diagram/journey-markdown"

describe("public component API", () => {
  it("exports sequence, journey, and markdown entry points", () => {
    const index = readFileSync(
      new URL("../components/ui/sequence-diagram/index.ts", import.meta.url),
      "utf8",
    )

    expect(index).toContain('export { SequenceDiagram } from "./sequence-diagram"')
    expect(index).toContain('export { JourneyPlayer } from "./journey-player"')
    expect(index).toContain("parseJourneyMarkdown")
    expect(index).toContain("journeySlidesFromMarkdown")
  })

  it("compiles markdown directly to JourneySlide[]", () => {
    const slides = journeySlidesFromMarkdown(
      "## Hello\n```mermaid\nsequenceDiagram\nA->>B: Hi\n```",
    )
    expect(slides).toHaveLength(1)
    expect(slides[0].id).toBe("hello")
  })
})
