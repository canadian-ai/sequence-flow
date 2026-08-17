"use client"

import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react"

import { cn } from "@/lib/utils"

import { useSequenceHover } from "./context"
import { SeqTooltip } from "./tooltip"
import type { ArrowHead, ArrowLine } from "./types"

const MARKER: Record<ArrowHead, string> = {
  filled: "url(#seq-arrow)",
  open: "url(#seq-arrow-open)",
  cross: "url(#seq-cross)",
  none: "",
}

interface MessageData {
  text: string
  line: ArrowLine
  head: ArrowHead
  self: boolean
  from: string
  to: string
  explanation?: string
  animateIn?: boolean
  enterDelay?: number
}

export function SeqMessageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const d = data as unknown as MessageData
  const { hoveredEdge, setHover } = useSequenceHover()
  const hovered = hoveredEdge === id
  const dimmed = hoveredEdge !== null && !hovered

  let path: string
  let labelX: number
  let labelY: number

  if (d.self) {
    const loop = 62
    const x = sourceX
    path = `M ${x} ${sourceY} C ${x + loop} ${sourceY}, ${x + loop} ${targetY}, ${x} ${targetY}`
    labelX = x + loop
    labelY = (sourceY + targetY) / 2
  } else {
    path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    labelX = (sourceX + targetX) / 2
    labelY = sourceY
  }

  const onEnter = () => setHover(id, [d.from, d.to])
  const onLeave = () => setHover(null, [])
  const enterDelay = d.animateIn ? `${d.enterDelay ?? 0}ms` : undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={MARKER[d.head]}
        interactionWidth={22}
        className={d.animateIn ? "seq-edge-enter" : undefined}
        style={{
          stroke: "var(--seq-accent)",
          strokeWidth: hovered ? 2.5 : 1.5,
          strokeDasharray: d.line === "dashed" ? "6 4" : undefined,
          opacity: dimmed ? 0.35 : 1,
          transition: "opacity 120ms, stroke-width 120ms",
          animationDelay: enterDelay,
        }}
      />
      <EdgeLabelRenderer>
        {d.text ? (
          <div
            className={cn(
              "nodrag nopan pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2",
              d.animateIn ? "seq-enter" : undefined,
            )}
            style={{
              left: labelX,
              top: labelY,
              opacity: dimmed ? 0.4 : 1,
              animationDelay: enterDelay,
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <SeqTooltip text={d.explanation} visible={hovered}>
              <div
                className={cn(
                  "cursor-default border px-2 py-0.5 text-xs font-medium transition-all",
                  "border-seq-accent bg-seq-accent text-seq-accent-foreground",
                  hovered && "ring-2 ring-seq-accent/40",
                )}
              >
                {d.text}
              </div>
            </SeqTooltip>
          </div>
        ) : null}
        {/* Invisible hit target over the line for hover when there is no label. */}
        <div
          className="nodrag nopan pointer-events-none absolute"
          style={{ left: labelX, top: labelY }}
        />
      </EdgeLabelRenderer>
      {/* Transparent wide path to capture hover along the whole line. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={22}
        style={{ pointerEvents: "stroke", cursor: "default" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />
    </>
  )
}

export const sequenceEdgeTypes = {
  seqMessage: SeqMessageEdge,
}
