import { describe, expect, it } from "vitest"

import {
  JourneyPlayer,
  SequenceDiagram,
  journeySlidesFromMarkdown,
  parseJourneyMarkdown,
  parseSequenceDiagram,
} from "../components/ui/sequence-diagram"

describe("public component API", () => {
  it("exports sequence, journey, and markdown entry points", () => {
    expect(SequenceDiagram).toBeTypeOf("function")
    expect(JourneyPlayer).toBeTypeOf("function")
    expect(parseSequenceDiagram).toBeTypeOf("function")
    expect(parseJourneyMarkdown).toBeTypeOf("function")
    expect(journeySlidesFromMarkdown).toBeTypeOf("function")
  })

  it("compiles markdown directly to JourneySlide[]", () => {
    const slides = journeySlidesFromMarkdown("## Hello\n```mermaid\nsequenceDiagram\nA->>B: Hi\n```")
    expect(slides).toHaveLength(1)
    expect(slides[0].id).toBe("hello")
  })
})
