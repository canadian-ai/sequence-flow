import { describe, expect, it } from "vitest"
import { decodeJourneyFragment, encodeJourneyFragment } from "../lib/journey-url"

const document = {
  title: "Example — café ☕",
  description: "A simple journey.",
  slides: [{ id: "start", title: "Start", chart: "sequenceDiagram\n  A->>B: Hello ☕", messageCaptions: ["Sends a message."] }],
}

describe("self-contained journey share links", () => {
  it("round trips Unicode without a server", () => {
    expect(decodeJourneyFragment(encodeJourneyFragment(document))).toEqual(document)
  })

  it("rejects missing or malformed artifacts", () => {
    expect(() => decodeJourneyFragment("#data=!!!")).toThrow(/missing or invalid/)
    expect(() => encodeJourneyFragment({ title: "Empty", slides: [] })).toThrow(/1 to 32 slides/)
  })

  it("does not accept arbitrary data masquerading as Mermaid", () => {
    expect(() => encodeJourneyFragment({ title: "Bad", slides: [{ id: "bad", chart: "graph LR; A-->B" }] })).toThrow(/sequenceDiagram/)
  })

  it("rejects duplicate slide ids", () => {
    expect(() => encodeJourneyFragment({ title: "Bad", slides: [document.slides[0], document.slides[0]] })).toThrow(/unique/)
  })
})
