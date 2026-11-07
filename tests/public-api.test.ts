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

  it("publishes external selections and invisible hit-target guards", () => {
    const diagram = readFileSync(new URL("../components/ui/sequence-diagram/sequence-diagram.tsx", import.meta.url), "utf8")
    const player = readFileSync(new URL("../components/ui/sequence-diagram/journey-player.tsx", import.meta.url), "utf8")
    const edge = readFileSync(new URL("../components/ui/sequence-diagram/edges.tsx", import.meta.url), "utf8")
    const css = readFileSync(new URL("../components/ui/sequence-diagram/sequence-diagram.css", import.meta.url), "utf8")
    expect(diagram).toContain("selectedMessageIndex")
    expect(diagram).toContain("onMessageSelect")
    expect(player).toContain("activeSlideId")
    expect(player).toContain("onSlideChange")
    expect(edge).toContain('className="seq-hit-target"')
    expect(css).toContain("stroke: transparent !important")
  })

  it("keeps long journeys visible when parent panels resize", () => {
    const diagram = readFileSync(new URL("../components/ui/sequence-diagram/sequence-diagram.tsx", import.meta.url), "utf8")
    const player = readFileSync(new URL("../components/ui/sequence-diagram/journey-player.tsx", import.meta.url), "utf8")
    expect(diagram).toContain("ResizeObserver")
    expect(diagram).toContain("fitDiagramToBounds")
    expect(diagram).toContain("maxZoom: 1")
    expect(player).toContain("diagramHeight")
  })

  it("compiles markdown directly to JourneySlide[]", () => {
    const slides = journeySlidesFromMarkdown(
      "## Hello\n```mermaid\nsequenceDiagram\nA->>B: Hi\n```",
    )
    expect(slides).toHaveLength(1)
    expect(slides[0].id).toBe("hello")
  })
})
