"use client"

import "@xyflow/react/dist/base.css"
import "./sequence-diagram.css"

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  getNodesBounds,
  getViewportForBounds,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { toPng } from "html-to-image"

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

/** Imperative handle exposed via ref for exporting the rendered diagram. */
export interface SequenceDiagramHandle {
  /** Renders the full diagram (not just the visible viewport) to a PNG and downloads it. */
  exportPng: (fileName?: string) => Promise<void>
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

const SequenceDiagramInner = forwardRef<SequenceDiagramHandle, SequenceDiagramProps>(
  function SequenceDiagramInner(
    {
      chart,
      className,
      controls = true,
      background = true,
      fitView = true,
      columnGap,
      messageGap,
      showBottomActors,
      animateIn,
    },
    ref,
  ) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { getNodes } = useReactFlow()
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null)
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)
  const [activeParticipants, setActiveParticipants] = useState<Set<string>>(
    () => new Set(),
  )

  const { nodes, edges } = useMemo(() => {
    const model = parseSequenceDiagram(chart)
    return buildSequenceGraph(model, { columnGap, messageGap, showBottomActors, animateIn })
  }, [chart, columnGap, messageGap, showBottomActors, animateIn])

  useImperativeHandle(
    ref,
    () => ({
      exportPng: async (fileName = "sequence-diagram.png") => {
        const container = containerRef.current
        const currentNodes = getNodes()
        if (!container || currentNodes.length === 0) return

        const viewportEl = container.querySelector<HTMLElement>(
          ".react-flow__viewport",
        )
        if (!viewportEl) return

        const padding = 48
        const bounds = getNodesBounds(currentNodes)
        const imageWidth = Math.ceil(bounds.width + padding * 2)
        const imageHeight = Math.ceil(bounds.height + padding * 2)
        const viewport = getViewportForBounds(
          bounds,
          imageWidth,
          imageHeight,
          0.1,
          2,
          padding,
        )
        const backgroundColor = getComputedStyle(container).backgroundColor

        const dataUrl = await toPng(viewportEl, {
          backgroundColor,
          width: imageWidth,
          height: imageHeight,
          pixelRatio: 2,
          style: {
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          },
        })

        const link = document.createElement("a")
        link.download = fileName
        link.href = dataUrl
        link.click()
      },
    }),
    [getNodes],
  )

  const hoverValue = useMemo(
    () => ({
      hoveredEdge,
      hoveredParticipant,
      hoveredBox,
      activeParticipants,
      setHover: (edge: string | null, participants: string[]) => {
        setHoveredEdge(edge)
        setActiveParticipants(new Set(participants))
      },
      setParticipantHover: setHoveredParticipant,
      setBoxHover: setHoveredBox,
    }),
    [hoveredEdge, hoveredParticipant, hoveredBox, activeParticipants],
  )

  return (
    <SequenceHoverContext.Provider value={hoverValue}>
      <div ref={containerRef} className={cn("relative size-full bg-background", className)}>
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
          // React Flow only enables pointer-events on a node's DOM wrapper when the
          // node is selectable/draggable or a top-level onNode* handler is set. Since
          // our nodes are neither, a harmless no-op handler here restores real hover
          // (mouseenter/mouseleave) on every custom node — group boxes, actors, etc.
          onNodeMouseEnter={() => {}}
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
  },
)

/**
 * A lightweight, read-only sequence diagram rendered with React Flow.
 * Author diagrams with Mermaid sequence-diagram syntax. Pass a ref to access
 * imperative export methods (e.g. `ref.current.exportPng()`).
 */
export const SequenceDiagram = forwardRef<SequenceDiagramHandle, SequenceDiagramProps>(
  function SequenceDiagram(props, ref) {
    return (
      <ReactFlowProvider>
        <SequenceDiagramInner {...props} ref={ref} />
      </ReactFlowProvider>
    )
  },
)
