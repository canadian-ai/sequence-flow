import { describe, expect, it } from "vitest"

import { normalizeSequenceSource, parseSequenceDiagram } from "../components/ui/sequence-diagram/parser"

describe("parseSequenceDiagram", () => {
  it("parses participants, messages, notes, boxes and annotations", () => {
    const model = parseSequenceDiagram(`sequenceDiagram
      %% tooltip Browser: Client app
      participant B as Browser
      box Server Tier
      participant A as API
      end
      B->>+A: GET /items %% tooltip: Request items | duration: 1200
      Note over A: Query cache
      A-->>-B: 200 OK`)

    expect(model.participants.map((p) => p.label)).toEqual(["Browser", "API"])
    expect(model.boxes).toHaveLength(1)
    expect(model.boxes[0].label).toBe("Server Tier")
    expect(model.events).toHaveLength(3)
    expect(model.events[0]).toMatchObject({ kind: "message", explanation: "Request items", durationMs: 1200 })
    expect(model.events[1]).toMatchObject({ kind: "note", text: "Query cache" })
  })

  it("creates undeclared participants referenced by messages", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nA->>B: Hello")
    expect(model.participants.map((p) => p.id)).toEqual(["A", "B"])
  })

  it("ignores unsupported control-flow frames while parsing their body", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nloop Retry\nA->>B: Ping\nend")
    expect(model.events).toHaveLength(1)
  })

  it("accepts fenced model output with html line breaks", () => {
    const input = [
      "```mermaid",
      "sequenceDiagram<br>",
      "<p>participant A as Agent</p><p>participant B as Builder</p>",
      "A->>B: Check <value> and <br/> retry",
      "```",
    ].join("\n")
    const parsed = parseSequenceDiagram(input)
    expect(parsed.participants.map((p) => p.label)).toEqual(["Agent", "Builder"])
    expect(parsed.events.filter((e) => e.kind === "message")).toHaveLength(1)
  })

  it("accepts escaped newline strings without stripping meaningful labels", () => {
    const parsed = parseSequenceDiagram("sequenceDiagram\\nA->>B: <T> remains literal\\nB-->>A: Done")
    expect(parsed.events).toHaveLength(2)
    expect(parsed.events[0]).toMatchObject({ text: "<T> remains literal" })
    expect(normalizeSequenceSource("```mermaid\nsequenceDiagram\nA->>B: Hi\n```")).toContain("A->>B: Hi")
  })

  it("supports self messages", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nA->>A: Recompute")
    expect(model.events[0]).toMatchObject({ kind: "message", from: "A", to: "A" })
  })
})
