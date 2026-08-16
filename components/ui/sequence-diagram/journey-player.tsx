"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { SequenceDiagram } from "./sequence-diagram"
import type { SequenceLayoutOptions } from "./types"

export interface JourneySlide {
  id: string
  /** Short heading shown above the diagram, e.g. "Step 2: Adding a database". */
  title?: string
  /** Optional commentary shown below the diagram, explaining what changed in this step. */
  caption?: string
  /** Mermaid-flavored sequence diagram definition for this step. */
  chart: string
}

export interface JourneyPlayerProps extends Omit<SequenceLayoutOptions, "animateIn"> {
  slides: JourneySlide[]
  className?: string
  /** Height of the diagram viewport. Defaults to 420px. */
  height?: number
}

/**
 * Plays a sequence of diagrams as a slideshow — each "slide" is a distinct
 * Mermaid chart with an optional title and caption. Nodes fade + rise in on
 * arrival. Navigate with the prev/next arrows, the dot indicator, or the
 * left/right arrow keys while the player is focused.
 */
export function JourneyPlayer({
  slides,
  className,
  height = 420,
  columnGap,
  messageGap,
  showBottomActors,
}: JourneyPlayerProps) {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const atStart = index === 0
  const atEnd = index === slides.length - 1

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)))
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goTo(index + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goTo(index - 1)
    }
  }

  if (!slide) return null

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={slide.title ?? "Diagram journey"}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn("flex flex-col gap-4 outline-none", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {slide.title ? (
            <span className="text-sm font-medium text-foreground">{slide.title}</span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            Step {index + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to step ${i + 1}${s.title ? `: ${s.title}` : ""}`}
                onClick={() => goTo(i)}
                className={cn(
                  "size-1.5 transition-colors",
                  i === index ? "bg-primary" : "bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
          <div className="flex border border-border">
            <button
              type="button"
              aria-label="Previous step"
              disabled={atStart}
              onClick={() => goTo(index - 1)}
              className="flex items-center justify-center p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next step"
              disabled={atEnd}
              onClick={() => goTo(index + 1)}
              className="flex items-center justify-center border-l border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden border border-border bg-card"
        style={{ height }}
      >
        <SequenceDiagram
          key={slide.id}
          chart={slide.chart}
          className="size-full"
          animateIn
          columnGap={columnGap}
          messageGap={messageGap}
          showBottomActors={showBottomActors}
        />
      </div>

      {slide.caption ? (
        <p className="border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
          {slide.caption}
        </p>
      ) : null}
    </div>
  )
}
