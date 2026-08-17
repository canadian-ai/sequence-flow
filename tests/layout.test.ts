import { describe, expect, it } from "vitest"

import { buildSequenceGraph, getStepSchedule } from "../components/ui/sequence-diagram/layout"
import { parseSequenceDiagram } from "../components/ui/sequence-diagram/parser"

describe("sequence layout", () => {
  it("honors per-step duration annotations in the reveal schedule", () => {
    const model = parseSequenceDiagram(`sequenceDiagram
participant A
participant B
A->>B: One %% duration: 1000
B-->>A: Two`)
    const schedule = getStepSchedule(model)
    expect(schedule.delays).toHaveLength(2)
    expect(schedule.delays[1] - schedule.delays[0]).toBe(1000)
  })

  it("scales the reveal schedule with playback speed", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nA->>B: One\nB-->>A: Two")
    const normal = getStepSchedule(model, 1)
    const slow = getStepSchedule(model, 2)
    expect(slow.actorSettleDelay).toBe(normal.actorSettleDelay * 2)
    expect(slow.delays[0]).toBe(normal.delays[0] * 2)
  })

  it("builds finite graph dimensions and message edges", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nparticipant A\nparticipant B\nA->>B: Hello")
    const graph = buildSequenceGraph(model)
    expect(graph.width).toBeGreaterThan(0)
    expect(graph.height).toBeGreaterThan(0)
    expect(graph.nodes.length).toBeGreaterThanOrEqual(2)
    expect(graph.edges).toHaveLength(1)
  })
})
