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

  it("paces default message reveals for sixth-grade reading speed", () => {
    const short = parseSequenceDiagram("sequenceDiagram\nA->>B: OK\nB-->>A: Done")
    const longer = parseSequenceDiagram(
      "sequenceDiagram\nA->>B: SELECT all active products from database\nB-->>A: Done",
    )

    const shortSchedule = getStepSchedule(short)
    const longSchedule = getStepSchedule(longer)
    const shortHold = shortSchedule.delays[1] - shortSchedule.delays[0]
    const longHold = longSchedule.delays[1] - longSchedule.delays[0]

    expect(shortHold).toBe(1600)
    // Six words at 160 WPM = 2250 ms, plus the 600 ms orientation beat.
    expect(longHold).toBe(2850)
  })

  it("uses a slower packet travel duration so the edge motion is trackable", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nparticipant A\nparticipant B\nA->>B: Hello")
    const graph = buildSequenceGraph(model, { animateIn: true })
    expect(graph.edges[0]?.data?.travelMs).toBe(650)
  })

  it("scales the reveal schedule with playback speed", () => {
    const model = parseSequenceDiagram("sequenceDiagram\nA->>B: One\nB-->>A: Two")
    const normal = getStepSchedule(model, 1)
    const slow = getStepSchedule(model, 2)
    expect(slow.actorSettleDelay).toBe(normal.actorSettleDelay * 2)
    expect(slow.delays[0]).toBe(normal.delays[0] * 2)
    expect(slow.delays[1] - slow.delays[0]).toBe((normal.delays[1] - normal.delays[0]) * 2)
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
