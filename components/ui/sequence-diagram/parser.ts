import type {
  ArrowHead,
  ArrowLine,
  SeqBox,
  SeqEvent,
  SeqModel,
  SeqParticipant,
} from "./types"

interface ArrowSpec {
  token: string
  line: ArrowLine
  head: ArrowHead
}

// Ordered most-specific first so `-->>` wins over `->>`, `-->` over `->`, etc.
const ARROWS: ArrowSpec[] = [
  { token: "-->>", line: "dashed", head: "filled" },
  { token: "->>", line: "solid", head: "filled" },
  { token: "--x", line: "dashed", head: "cross" },
  { token: "-x", line: "solid", head: "cross" },
  { token: "--)", line: "dashed", head: "open" },
  { token: "-)", line: "solid", head: "open" },
  { token: "-->", line: "dashed", head: "none" },
  { token: "->", line: "solid", head: "none" },
]

const IGNORED_BLOCK_STARTS =
  /^(loop|alt|else|opt|par|and|critical|option|break|rect|autonumber)\b/i
const PARTICIPANT_TOOLTIP = /^tooltip\s+([^:]+):\s*(.+)$/i
const STEP_DIRECTIVE = /^(tooltip|duration)\s*:\s*(.+?)\s*$/i

function parseStepDirectives(commentBody: string): { explanation?: string; durationMs?: number } {
  const out: { explanation?: string; durationMs?: number } = {}
  for (const part of commentBody.split("|")) {
    const m = part.trim().match(STEP_DIRECTIVE)
    if (!m) continue
    const key = m[1].toLowerCase()
    if (key === "tooltip") {
      out.explanation = m[2].trim()
    } else {
      const ms = Number.parseInt(m[2], 10)
      if (Number.isFinite(ms) && ms > 0) out.durationMs = ms
    }
  }
  return out
}

function extractTooltip(
  rawLine: string,
  labelNotes: Map<string, string>,
): { line: string; explanation?: string; durationMs?: number; consumed: boolean } {
  const i = rawLine.indexOf("%%")
  if (i === -1) return { line: rawLine.trim(), consumed: false }
  const before = rawLine.slice(0, i).trim()
  const commentBody = rawLine.slice(i + 2).trim()
  const participantMatch = commentBody.match(PARTICIPANT_TOOLTIP)
  if (participantMatch) {
    labelNotes.set(participantMatch[1].trim().toLowerCase(), participantMatch[2].trim())
    if (!before) return { line: "", consumed: true }
    return { line: before, consumed: false }
  }
  const { explanation, durationMs } = parseStepDirectives(commentBody)
  if (explanation !== undefined || durationMs !== undefined) {
    return { line: before, explanation, durationMs, consumed: false }
  }
  return { line: before, consumed: false }
}

function findArrow(text: string): { spec: ArrowSpec; at: number } | null {
  let best: { spec: ArrowSpec; at: number } | null = null
  for (const spec of ARROWS) {
    const at = text.indexOf(spec.token)
    if (at === -1) continue
    if (!best || at < best.at) best = { spec, at }
  }
  return best
}

export function parseSequenceDiagram(input: string): SeqModel {
  const participants: SeqParticipant[] = []
  const byId = new Map<string, SeqParticipant>()
  const boxes: SeqBox[] = []
  const events: SeqEvent[] = []
  const labelNotes = new Map<string, string>()
  let title: string | undefined
  let currentBox: SeqBox | null = null
  let eventIndex = 0

  const ensureParticipant = (raw: string, actor = false): SeqParticipant => {
    const id = raw.trim()
    let p = byId.get(id)
    if (!p) {
      p = { id, label: id, actor }
      byId.set(id, p)
      participants.push(p)
      if (currentBox) {
        p.boxId = currentBox.id
        currentBox.participantIds.push(id)
      }
    }
    return p
  }

  const lines = input.split(/\r?\n/)
  for (const rawLine of lines) {
    const tip = extractTooltip(rawLine, labelNotes)
    if (tip.consumed) continue
    const line = tip.line
    const messageExplanation = tip.explanation
    const messageDurationMs = tip.durationMs
    if (!line) continue

    const lower = line.toLowerCase()
    if (lower === "sequencediagram") continue

    if (lower.startsWith("title")) {
      const m = line.match(/^title\s*:?\s*(.+)$/i)
      if (m) title = m[1].trim()
      continue
    }

    if (lower.startsWith("box ") || lower === "box") {
      const rest = line.slice(3).trim()
      const label = rest
        .replace(/^rgba?\([^)]*\)\s*/i, "")
        .replace(/^#[0-9a-f]{3,8}\s+/i, "")
        .replace(/^transparent\s+/i, "")
      currentBox = { id: `box-${boxes.length}`, label: label.trim(), participantIds: [] }
      boxes.push(currentBox)
      continue
    }

    if (lower === "end") {
      if (currentBox) currentBox = null
      continue
    }
    if (IGNORED_BLOCK_STARTS.test(line)) continue

    const partMatch = line.match(/^(participant|actor)\s+(.+)$/i)
    if (partMatch) {
      const isActor = partMatch[1].toLowerCase() === "actor"
      const body = partMatch[2].trim()
      const asMatch = body.match(/^(.+?)\s+as\s+(.+)$/i)
      if (asMatch) {
        const p = ensureParticipant(asMatch[1], isActor)
        p.label = asMatch[2].trim()
        p.actor = isActor
      } else {
        const p = ensureParticipant(body, isActor)
        p.actor = isActor
      }
      continue
    }

    const noteMatch = line.match(/^note\s+(right of|left of|over)\s+(.+?)\s*:\s*(.+)$/i)
    if (noteMatch) {
      const placement = noteMatch[1].toLowerCase().startsWith("right")
        ? "right"
        : noteMatch[1].toLowerCase().startsWith("left") ? "left" : "over"
      const ids = noteMatch[2].split(",").map((s) => s.trim()).filter(Boolean)
      ids.forEach((id) => ensureParticipant(id))
      events.push({
        kind: "note",
        index: eventIndex++,
        placement,
        participantIds: ids,
        text: noteMatch[3].trim(),
        explanation: messageExplanation,
        durationMs: messageDurationMs,
      })
      continue
    }

    const actMatch = line.match(/^(activate|deactivate)\s+(.+)$/i)
    if (actMatch) {
      const id = actMatch[2].trim()
      ensureParticipant(id)
      events.push({
        kind: actMatch[1].toLowerCase() as "activate" | "deactivate",
        index: eventIndex++,
        participantId: id,
      })
      continue
    }

    const arrow = findArrow(line)
    if (arrow) {
      const from = line.slice(0, arrow.at).trim()
      let after = line.slice(arrow.at + arrow.spec.token.length)
      let text = ""
      const colon = after.indexOf(":")
      if (colon !== -1) {
        text = after.slice(colon + 1).trim()
        after = after.slice(0, colon)
      }
      let target = after.trim()
      let activateTarget = false
      let deactivateSource = false
      if (target.startsWith("+")) {
        activateTarget = true
        target = target.slice(1).trim()
      } else if (target.startsWith("-")) {
        deactivateSource = true
        target = target.slice(1).trim()
      }
      if (!from || !target) continue
      ensureParticipant(from)
      ensureParticipant(target)
      events.push({
        kind: "message",
        index: eventIndex++,
        from,
        to: target,
        text,
        line: arrow.spec.line,
        head: arrow.spec.head,
        self: from === target,
        activateTarget,
        deactivateSource,
        explanation: messageExplanation,
        durationMs: messageDurationMs,
      })
      continue
    }
  }

  for (const p of participants) {
    const text = labelNotes.get(p.id.toLowerCase()) ?? labelNotes.get(p.label.toLowerCase())
    if (text) p.explanation = text
  }
  for (const b of boxes) {
    const text = labelNotes.get(b.label.toLowerCase())
    if (text) b.explanation = text
  }

  return { title, participants, boxes, events }
}
