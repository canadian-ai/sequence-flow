"use client"

import { Handle, type NodeProps, Position } from "@xyflow/react"
import { User } from "lucide-react"

import { cn } from "@/lib/utils"

import { useSequenceHover } from "./context"
import type { HandleSpec } from "./layout"
import { SeqTooltip } from "./tooltip"

/** Grouping box drawn behind a set of participants. Hover reveals its explanation, if any. */
export function SeqGroupNode({ data }: NodeProps) {
  const d = data as {
    boxId: string
    label: string
    width: number
    height: number
    explanation?: string
  }
  const { hoveredBox, setBoxHover } = useSequenceHover()
  const hovered = hoveredBox === d.boxId

  return (
    <div
      role={d.explanation ? "button" : undefined}
      tabIndex={d.explanation ? 0 : undefined}
      className={cn(
        "relative cursor-default border bg-seq-group/[0.06] transition-colors",
        hovered
          ? "border-solid border-seq-accent bg-seq-accent/[0.08] ring-1 ring-seq-accent"
          : "border-dashed border-border",
      )}
      style={{ width: d.width, height: d.height }}
      onMouseEnter={() => setBoxHover(d.boxId)}
      onMouseLeave={() => setBoxHover(null)}
      onFocus={() => setBoxHover(d.boxId)}
      onBlur={() => setBoxHover(null)}
    >
      {d.label ? (
        <SeqTooltip text={d.explanation} visible={hovered} placement="top">
          <span
            className={cn(
              "absolute left-3 -top-3 border bg-card px-2 py-0.5 text-xs font-medium tracking-wide transition-colors",
              hovered ? "border-seq-accent text-seq-accent" : "border-border text-muted-foreground",
            )}
          >
            {d.label}
          </span>
        </SeqTooltip>
      ) : null}
    </div>
  )
}

/** Vertical dashed lifeline that hosts message handles. */
export function SeqLifelineNode({ data }: NodeProps) {
  const d = data as { participant: string; height: number; handles: HandleSpec[] }
  const { activeParticipants, hoveredEdge } = useSequenceHover()
  const active = activeParticipants.has(d.participant)
  return (
    <div style={{ width: 2, height: d.height }} className="relative">
      <div
        className={cn(
          "absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dashed transition-colors",
          active ? "border-seq-accent" : "border-seq-lifeline/70",
        )}
        style={{ opacity: hoveredEdge && !active ? 0.4 : 1 }}
      />
      {d.handles.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={Position.Left}
          isConnectable={false}
          style={{
            top: h.top,
            left: 1,
            width: 1,
            height: 1,
            minWidth: 0,
            minHeight: 0,
            border: "none",
            background: "transparent",
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

/** Activation bar overlaid on a lifeline. */
export function SeqActivationNode({ data }: NodeProps) {
  const d = data as { participant: string; height: number }
  const { activeParticipants, hoveredEdge } = useSequenceHover()
  const active = activeParticipants.has(d.participant)
  return (
    <div
      className={cn(
        "border transition-colors",
        active
          ? "border-seq-accent bg-seq-accent/25"
          : "border-seq-accent/40 bg-seq-activation",
      )}
      style={{ width: 10, height: d.height, opacity: hoveredEdge && !active ? 0.5 : 1 }}
    />
  )
}

/** Participant head box (or actor glyph). Hover reveals its explanation, if any. */
export function SeqActorNode({ data }: NodeProps) {
  const d = data as {
    participant: string
    label: string
    actor: boolean
    width: number
    explanation?: string
    placement?: "top" | "bottom"
  }
  const { activeParticipants, hoveredEdge, hoveredParticipant, setParticipantHover } =
    useSequenceHover()
  const active = activeParticipants.has(d.participant)
  const directHover = hoveredParticipant === d.participant
  const highlighted = active || directHover

  return (
    <SeqTooltip text={d.explanation} visible={directHover} placement={d.placement}>
      <div
        role={d.explanation ? "button" : undefined}
        tabIndex={d.explanation ? 0 : undefined}
        className={cn(
          "flex h-[52px] cursor-default items-center justify-center gap-2 border bg-card px-3 text-center transition-colors",
          highlighted ? "border-seq-accent ring-1 ring-seq-accent" : "border-border",
        )}
        style={{ width: d.width, opacity: hoveredEdge && !active ? 0.45 : 1 }}
        onMouseEnter={() => setParticipantHover(d.participant)}
        onMouseLeave={() => setParticipantHover(null)}
        onFocus={() => setParticipantHover(d.participant)}
        onBlur={() => setParticipantHover(null)}
      >
        {d.actor ? (
          <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : null}
        <span className="text-sm font-medium leading-tight text-card-foreground text-balance">
          {d.label}
        </span>
      </div>
    </SeqTooltip>
  )
}

/** Note / badge callout. */
export function SeqNoteNode({ data }: NodeProps) {
  const d = data as { text: string; width: number; height: number }
  return (
    <div
      className="flex items-center justify-center border border-border bg-muted px-3 py-2 text-center text-xs leading-snug text-muted-foreground"
      style={{ width: d.width, minHeight: d.height }}
    >
      {d.text}
    </div>
  )
}

export const sequenceNodeTypes = {
  seqGroup: SeqGroupNode,
  seqLifeline: SeqLifelineNode,
  seqActivation: SeqActivationNode,
  seqActor: SeqActorNode,
  seqNote: SeqNoteNode,
}
