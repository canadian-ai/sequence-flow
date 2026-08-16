"use client"

import "@xyflow/react/dist/base.css"

import { useMemo, useState } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react"

import { cn } from "@/lib/utils"

import { SequenceHoverContext } from "./context"
import { sequenceEdgeTypes } from "./edges"
import { buildSequenceGraph } from "./layout"
import { sequenceNodeTypes } from "./nodes"
import { parseSequenceDiagram } from "./parser"
import type { SequenceLayoutOptions } from "./types"

export interface SequenceDiagramProps extends SequenceLayoutOptions {
  /** Mermaid-flavored sequence diagram definition. */
  chart: string
  className?: string
  /** Show the pan/zoom control bar. Defaults to true. */
  controls?: boolean
  /** Show the dotted background grid. Defaults to true. */
  background?: boolean
  /** Fit the diagram to the viewport on mount. Defaults to true. */
  fitView?: boolean
}

function MarkerDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <marker
          id="seq-arrow"
          markerWidth="12"
          markerHeight="12"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L9,4 L0,8 z" fill="var(--seq-accent)" />
        </marker>
        <marker
          id="seq-arrow-open"
          markerWidth="12"
          markerHeight="12"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0,0 L9,4 L0,8"
            fill="none"
            stroke="var(--seq-accent)"
            strokeWidth="1.5"
          />
        </marker>
        <marker
          id="seq-cross"
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M1,1 L7,7 M7,1 L1,7"
            fill="none"
            stroke="var(--seq-accent)"
            strokeWidth="1.6"
          />
        </marker>
      </defs>
    </svg>
  )
}

function SequenceDiagramInner({
  chart,
  className,
  controls = true,
  background = true,
  fitView = true,
  columnGap,
  messageGap,
  showBottomActors,
}: SequenceDiagramProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [activeParticipants, setActiveParticipants] = useState<Set<string>>(
    () => new Set(),
  )

  const { nodes, edges } = useMemo(() => {
    const model = parseSequenceDiagram(chart)
    return buildSequenceGraph(model, { columnGap, messageGap, showBottomActors })
  }, [chart, columnGap, messageGap, showBottomActors])

  const hoverValue = useMemo(
    () => ({
      hoveredEdge,
      activeParticipants,
      setHover: (edge: string | null, participants: string[]) => {
        setHoveredEdge(edge)
        setActiveParticipants(new Set(participants))
      },
    }),
    [hoveredEdge, activeParticipants],
  )

  return (
    <SequenceHoverContext.Provider value={hoverValue}>
      <div className={cn("relative size-full", className)}>
        <MarkerDefs />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={sequenceNodeTypes}
          edgeTypes={sequenceEdgeTypes}
          fitView={fitView}
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: false }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          edgesFocusable={false}
          panOnScroll
          zoomOnScroll={false}
          className="bg-background"
        >
          {background ? (
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              className="text-border"
            />
          ) : null}
          {controls ? <Controls showInteractive={false} /> : null}
        </ReactFlow>
      </div>
    </SequenceHoverContext.Provider>
  )
}

/**
 * A lightweight, read-only sequence diagram rendered with React Flow.
 * Author diagrams with Mermaid sequence-diagram syntax.
 */
export function SequenceDiagram(props: SequenceDiagramProps) {
  return (
    <ReactFlowProvider>
      <SequenceDiagramInner {...props} />
    </ReactFlowProvider>
  )
}
