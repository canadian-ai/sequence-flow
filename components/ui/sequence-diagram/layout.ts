import { type Edge, type Node, Position } from "@xyflow/react"

import type { SeqModel, SequenceLayoutOptions } from "./types"

const ACTOR_W = 132
const ACTOR_H = 52
const MARGIN_X = 40
const MARGIN_TOP = 24
const BOX_LABEL_H = 26
const FIRST_MSG_OFFSET = 44
const SELF_H = 46
const NOTE_H = 44
const ACT_W = 10
const BOTTOM_GAP = 20

export interface HandleSpec {
  id: string
  type: "source" | "target"
  top: number
}

/** Base (speed = 1) entrance-animation timing constants, shared with JourneyPlayer. */
const BASE_ACTOR_STAGGER_MS = 70
/**
 * How long the traveling packet takes to move from source to target.
 * Deliberately slower than a micro-interaction so the eye can follow the edge.
 */
const BASE_TRAVEL_MS = 650
/**
 * Pace default message reveals around a conservative sixth-grade reading rate.
 * Research puts sixth-grade comprehension-based silent reading near 165 WPM;
 * we use 160 WPM and add a short orientation beat because diagram labels are
 * technical fragments rather than continuous prose.
 */
const READING_WPM = 160
const MS_PER_WORD = 60_000 / READING_WPM
const READING_ORIENTATION_MS = 600
const MIN_STEP_HOLD_MS = 1600
const MAX_STEP_HOLD_MS = 5000
const BASE_SETTLE_PAD_MS = 150

function readableHoldMs(text: string) {
  const words = text.trim().match(/\S+/g)?.length ?? 0
  const readingTime = words * MS_PER_WORD + READING_ORIENTATION_MS
  return Math.min(MAX_STEP_HOLD_MS, Math.max(MIN_STEP_HOLD_MS, readingTime))
}

export interface StepSchedule {
  /** Delay (ms) before the actor boxes have finished settling in. */
  actorSettleDelay: number
  /**
   * Absolute entrance delay (ms) for each message/note step, in
   * chronological (top-to-bottom) order. `delays[i]` is when step `i`
   * animates in; the gap to the next step is based on a sixth-grade reading
   * pace for that step's visible text, unless `%% duration: <ms>` overrides it.
   */
  delays: number[]
}

/**
 * Compute a chart's `animateIn` schedule: actors fade in first, then
 * messages/notes reveal one at a time. Default holds scale with the amount of
 * text at a conservative sixth-grade reading pace, while explicit duration
 * annotations remain authoritative. Both `buildSequenceGraph` and
 * JourneyPlayer call this same function so edge motion and live captions stay
 * synchronized.
 */
export function getStepSchedule(model: SeqModel, speed = 1): StepSchedule {
  const actorSettleDelay =
    model.participants.length * BASE_ACTOR_STAGGER_MS * speed + BASE_SETTLE_PAD_MS * speed
  const delays: number[] = []
  let cursor = actorSettleDelay
  for (const ev of model.events) {
    if (ev.kind !== "message" && ev.kind !== "note") continue
    delays.push(cursor)
    const defaultHold = readableHoldMs(ev.text)
    const hold = ev.durationMs != null ? ev.durationMs * speed : defaultHold * speed
    cursor += hold
  }
  return { actorSettleDelay, delays }
}

export interface SequenceGraph {
  nodes: Node[]
  edges: Edge[]
  width: number
  height: number
}

/** Convert a parsed model into positioned React Flow nodes and edges. */
export function buildSequenceGraph(
  model: SeqModel,
  options: SequenceLayoutOptions = {},
): SequenceGraph {
  const COL_GAP = options.columnGap ?? 220
  const MSG_GAP = options.messageGap ?? 56
  const showBottom = options.showBottomActors ?? true
  const animateIn = options.animateIn ?? false
  const speed = options.speed ?? 1
  const STAGGER_MS = BASE_ACTOR_STAGGER_MS * speed

  const index = new Map<string, number>()
  model.participants.forEach((p, i) => index.set(p.id, i))
  const xOf = (id: string) =>
    MARGIN_X + ACTOR_W / 2 + (index.get(id) ?? 0) * COL_GAP
  /** Entrance delay (ms) for a node anchored to participant `id`, staggered left-to-right. */
  const enterDelayOf = (id: string) => (index.get(id) ?? 0) * STAGGER_MS

  const { delays: stepDelays } = getStepSchedule(model, speed)
  let stepIndex = 0
  const nextStepDelay = () => stepDelays[stepIndex++]

  const hasBoxes = model.boxes.length > 0
  const headY = MARGIN_TOP + (hasBoxes ? BOX_LABEL_H : 0)
  const lifelineTop = headY + ACTOR_H

  const handles: Record<string, HandleSpec[]> = {}
  const addHandle = (
    pid: string,
    id: string,
    type: "source" | "target",
    absY: number,
  ) => {
    ;(handles[pid] ||= []).push({ id, type, top: absY - lifelineTop })
  }

  interface MsgLayout {
    index: number
    from: string
    to: string
    self: boolean
    data: Record<string, unknown>
  }
  const msgLayouts: MsgLayout[] = []

  interface ActBar {
    pid: string
    top: number
    height: number
    depth: number
  }
  const activations: ActBar[] = []
  const activeStacks: Record<string, { startY: number; depth: number }[]> = {}
  const pushAct = (pid: string, startY: number) => {
    const stack = (activeStacks[pid] ||= [])
    stack.push({ startY, depth: stack.length })
  }
  const popAct = (pid: string, endY: number) => {
    const stack = activeStacks[pid]
    if (!stack || stack.length === 0) return
    const s = stack.pop()!
    activations.push({
      pid,
      top: s.startY,
      height: Math.max(endY - s.startY, 18),
      depth: s.depth,
    })
  }

  interface NoteLayout {
    id: string
    x: number
    y: number
    width: number
    text: string
    explanation?: string
    enterDelay: number
  }
  const notes: NoteLayout[] = []

  let y = lifelineTop + FIRST_MSG_OFFSET

  for (const ev of model.events) {
    if (ev.kind === "message") {
      const my = y
      if (ev.self) {
        const y2 = my + SELF_H
        addHandle(ev.from, `m${ev.index}-s`, "source", my)
        addHandle(ev.from, `m${ev.index}-t`, "target", y2)
        y = y2 + MSG_GAP
      } else {
        addHandle(ev.from, `m${ev.index}-s`, "source", my)
        addHandle(ev.to, `m${ev.index}-t`, "target", my)
        y = my + MSG_GAP
      }
      if (ev.activateTarget) pushAct(ev.to, my)
      if (ev.deactivateSource) popAct(ev.from, ev.self ? my + SELF_H : my)
      msgLayouts.push({
        index: ev.index,
        from: ev.from,
        to: ev.to,
        self: ev.self,
        data: {
          text: ev.text,
          line: ev.line,
          head: ev.head,
          self: ev.self,
          from: ev.from,
          to: ev.to,
          explanation: ev.explanation,
          animateIn,
          enterDelay: nextStepDelay(),
          travelMs: BASE_TRAVEL_MS * speed,
        },
      })
    } else if (ev.kind === "note") {
      const ids = ev.participantIds
      let nx: number
      let nw: number
      if (ev.placement === "over") {
        const xs = ids.map(xOf)
        const min = Math.min(...xs)
        const max = Math.max(...xs)
        nw = ids.length > 1 ? max - min + ACTOR_W : 150
        nx = (min + max) / 2 - nw / 2
      } else if (ev.placement === "right") {
        nx = xOf(ids[0]) + 16
        nw = 150
      } else {
        nw = 150
        nx = xOf(ids[0]) - 16 - nw
      }
      notes.push({
        id: `note-${ev.index}`,
        x: nx,
        y,
        width: nw,
        text: ev.text,
        explanation: ev.explanation,
        enterDelay: nextStepDelay(),
      })
      y += NOTE_H + 20
    } else if (ev.kind === "activate") {
      pushAct(ev.participantId, y)
    } else if (ev.kind === "deactivate") {
      popAct(ev.participantId, y)
    }
  }

  // Close any activations left open.
  for (const pid of Object.keys(activeStacks)) {
    while (activeStacks[pid].length) popAct(pid, y)
  }

  const bottomHeadY = y + BOTTOM_GAP
  const lifelineHeight =
    (showBottom ? bottomHeadY : y + BOTTOM_GAP) - lifelineTop
  const height =
    (showBottom ? bottomHeadY + ACTOR_H : y + BOTTOM_GAP) + MARGIN_TOP
  const lastX = xOf(model.participants[model.participants.length - 1]?.id ?? "")
  const width = lastX + ACTOR_W / 2 + MARGIN_X

  const nodes: Node[] = []

  // Group boxes (lowest layer).
  for (const box of model.boxes) {
    if (box.participantIds.length === 0) continue
    const xs = box.participantIds.map(xOf)
    const left = Math.min(...xs) - ACTOR_W / 2 - 14
    const right = Math.max(...xs) + ACTOR_W / 2 + 14
    nodes.push({
      id: box.id,
      type: "seqGroup",
      position: { x: left, y: MARGIN_TOP },
      data: {
        boxId: box.id,
        label: box.label,
        width: right - left,
        height: height - MARGIN_TOP * 1.5,
        explanation: box.explanation,
        animateIn,
        enterDelay: Math.min(...box.participantIds.map(enterDelayOf)),
      },
      draggable: false,
      selectable: false,
      zIndex: 0,
    })
  }

  // Lifelines.
  for (const p of model.participants) {
    nodes.push({
      id: `ll-${p.id}`,
      type: "seqLifeline",
      position: { x: xOf(p.id) - 1, y: lifelineTop },
      data: { participant: p.id, height: lifelineHeight, handles: handles[p.id] ?? [] },
      draggable: false,
      selectable: false,
      zIndex: 1,
    })
  }

  // Activation bars.
  activations.forEach((a, i) => {
    nodes.push({
      id: `act-${i}`,
      type: "seqActivation",
      position: { x: xOf(a.pid) - ACT_W / 2 + a.depth * 4, y: a.top },
      data: { participant: a.pid, height: a.height },
      draggable: false,
      selectable: false,
      zIndex: 3,
    })
  })

  // Actor heads (top + optional bottom).
  for (const p of model.participants) {
    nodes.push({
      id: `head-${p.id}`,
      type: "seqActor",
      position: { x: xOf(p.id) - ACTOR_W / 2, y: headY },
      data: {
        participant: p.id,
        label: p.label,
        actor: p.actor,
        width: ACTOR_W,
        explanation: p.explanation,
        placement: "top",
        animateIn,
        enterDelay: enterDelayOf(p.id),
      },
      draggable: false,
      selectable: false,
      zIndex: 5,
    })
    if (showBottom) {
      nodes.push({
        id: `head-b-${p.id}`,
        type: "seqActor",
        position: { x: xOf(p.id) - ACTOR_W / 2, y: bottomHeadY },
        data: {
          participant: p.id,
          label: p.label,
          actor: p.actor,
          width: ACTOR_W,
          explanation: p.explanation,
          placement: "bottom",
          animateIn,
          enterDelay: enterDelayOf(p.id),
        },
        draggable: false,
        selectable: false,
        zIndex: 5,
      })
    }
  }

  // Notes.
  for (const n of notes) {
    nodes.push({
      id: n.id,
      type: "seqNote",
      position: { x: n.x, y: n.y },
      data: {
        text: n.text,
        width: n.width,
        height: NOTE_H,
        explanation: n.explanation,
        animateIn,
        enterDelay: n.enterDelay,
      },
      draggable: false,
      selectable: false,
      zIndex: 6,
    })
  }

  // Message edges.
  const edges: Edge[] = msgLayouts.map((m) => ({
    id: `e${m.index}`,
    source: `ll-${m.from}`,
    sourceHandle: `m${m.index}-s`,
    target: `ll-${m.to}`,
    targetHandle: `m${m.index}-t`,
    type: "seqMessage",
    data: m.data,
    zIndex: 4,
  }))

  return { nodes, edges, width, height }
}

export { Position }
