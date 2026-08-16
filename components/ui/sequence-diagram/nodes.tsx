"use client"

import { Handle, type NodeProps, Position } from "@xyflow/react"
import { User } from "lucide-react"

import { cn } from "@/lib/utils"

import { useSequenceHover } from "./context"
import type { HandleSpec } from "./layout"

/** Grouping box drawn behind a set of participants. */
export function SeqGroupNode({ data }: NodeProps) {
  const d = data as { label: string; width: number; height: number }
  return (
    <div
      className="rounded-lg border border-dashed border-border bg-seq-group/60"
      style={{ width: d.width, height: d.height }}
    >
      {d.label ? (
        <span className="absolute left-3 top-2 text-xs font-medium tracking-wide text-muted-foreground">
          {d.label}
        </span>
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
        "rounded-[2px] border transition-colors",
        active
          ? "border-seq-accent bg-seq-accent/25"
          : "border-seq-accent/40 bg-seq-activation",
      )}
      style={{ width: 10, height: d.height, opacity: hoveredEdge && !active ? 0.5 : 1 }}
    />
  )
}

/** Participant head box (or actor glyph). */
export function SeqActorNode({ data }: NodeProps) {
  const d = data as {
    participant: string
    label: string
    actor: boolean
    width: number
  }
  const { activeParticipants, hoveredEdge } = useSequenceHover()
  const active = activeParticipants.has(d.participant)
  return (
    <div
      className={cn(
        "flex h-[52px] items-center justify-center gap-2 rounded-md border bg-card px-3 text-center shadow-sm transition-colors",
        active ? "border-seq-accent ring-1 ring-seq-accent" : "border-border",
      )}
      style={{ width: d.width, opacity: hoveredEdge && !active ? 0.45 : 1 }}
    >
      {d.actor ? (
        <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
      <span className="text-sm font-medium leading-tight text-card-foreground text-balance">
        {d.label}
      </span>
    </div>
  )
}

/** Note / badge callout. */
export function SeqNoteNode({ data }: NodeProps) {
  const d = data as { text: string; width: number; height: number }
  return (
    <div
      className="flex items-center justify-center rounded-sm border border-border bg-muted px-3 py-2 text-center text-xs leading-snug text-muted-foreground shadow-sm"
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
