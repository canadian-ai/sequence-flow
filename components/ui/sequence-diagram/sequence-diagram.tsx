"use client"

import "@xyflow/react/dist/base.css"
import "./sequence-diagram.css"

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
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
  selectedMessageIndex?: number | null
  onMessageSelect?: (event: { index: number; from: string; to: string; text: string }) => void
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
      selectedMessageIndex = null,
      onMessageSelect,
      controls = true,
      background = true,
      fitView = true,
      columnGap,
      messageGap,
      showBottomActors,
      animateIn,
      speed,
    },
    ref,
  ) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { getNodes, fitView: fitDiagramToBounds } = useReactFlow()
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null)
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null)
  const [hoveredBox, setHoveredBox] = useState<string | null>(null)
  const [activeParticipants, setActiveParticipants] = useState<Set<string>>(
    () => new Set(),
  )

  const { nodes, edges } = useMemo(() => {
    const model = parseSequenceDiagram(chart)
    return buildSequenceGraph(model, {
      columnGap,
      messageGap,
      showBottomActors,
      animateIn,
      speed,
    })
  }, [chart, columnGap, messageGap, showBottomActors, animateIn, speed])

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

  // React Flow's initial fitView can fire before the parent has its final
  // dimensions. Refit on diagram content and container resize so arrows,
  // labels and actor boxes remain fully visible on mobile, tab switches,
  // and animated journeys.
  useEffect(() => {
    if (!fitView) return
    const container = containerRef.current
    if (!container || typeof ResizeObserver === "undefined") return
    let frame = 0
    const refit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          void fitDiagramToBounds({ padding: 0.22, maxZoom: 1, duration: 0 })
        }
      })
    }
    const observer = new ResizeObserver(refit)
    observer.observe(container)
    refit()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [fitView, fitDiagramToBounds, nodes, edges])

  const hoverValue = useMemo(
    () => ({
      hoveredEdge,
      selectedMessageIndex,
      onMessageSelect: onMessageSelect ?? (() => {}),
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
    [hoveredEdge, hoveredParticipant, hoveredBox, activeParticipants, selectedMessageIndex, onMessageSelect],
  )

  return (
    <SequenceHoverContext.Provider value={hoverValue}>
      <div ref={containerRef} className={cn("sequence-flow-diagram relative size-full bg-background", className)}>
        <MarkerDefs />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={sequenceNodeTypes}
          edgeTypes={sequenceEdgeTypes}
          fitView={fitView}
          fitViewOptions={{ padding: 0.22, maxZoom: 1 }}
          minZoom={0.06}
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
