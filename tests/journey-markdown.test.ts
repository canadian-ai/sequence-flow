import { describe, expect, it } from "vitest"

import { parseJourneyMarkdown } from "../components/ui/sequence-diagram/journey-markdown"

describe("parseJourneyMarkdown", () => {
  it("parses headings, captions, annotations, and mermaid fences", () => {
    const doc = parseJourneyMarkdown(`# Checkout\n\nA guided flow.\n\n## Request\n<!-- @id: request -->\n<!-- @message: Browser sends the request. -->\nExplain **why** this happens.\n\n\`\`\`mermaid\nsequenceDiagram\n  B->>A: GET /cart\n\`\`\`\n`)

    expect(doc.title).toBe("Checkout")
    expect(doc.description).toBe("A guided flow.")
    expect(doc.slides).toHaveLength(1)
    expect(doc.slides[0]).toMatchObject({
      id: "request",
      title: "Request",
      caption: "Explain **why** this happens.",
      messageCaptions: ["Browser sends the request."],
    })
    expect(doc.slides[0].chart).toContain("B->>A: GET /cart")
  })

  it("generates stable unique ids for duplicate headings", () => {
    const doc = parseJourneyMarkdown(`## Step\n\`\`\`mermaid\nsequenceDiagram\nA->>B: One\n\`\`\`\n## Step\n\`\`\`mermaid\nsequenceDiagram\nA->>B: Two\n\`\`\``)
    expect(doc.slides.map((slide) => slide.id)).toEqual(["step", "step-2"])
  })

  it("rejects slides without a mermaid block", () => {
    expect(() => parseJourneyMarkdown("## Broken\nNo chart here.")).toThrow(/missing a mermaid code block/i)
  })

  it("rejects unclosed mermaid fences", () => {
    expect(() => parseJourneyMarkdown("## Broken\n```mermaid\nsequenceDiagram\nA->>B: Hi")).toThrow(/unclosed mermaid/i)
  })

  it("requires at least one slide", () => {
    expect(() => parseJourneyMarkdown("# Just a title")).toThrow(/at least one/i)
  })
})
