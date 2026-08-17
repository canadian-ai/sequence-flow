"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  Repeat2,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { getStepSchedule } from "./layout"
import { parseSequenceDiagram } from "./parser"
import { SequenceDiagram } from "./sequence-diagram"
import type { SequenceLayoutOptions } from "./types"

export interface JourneySlide {
  id: string
  title?: string
  caption?: string
  chart: string
  messageCaptions?: string[]
}

function captionsFromChart(chart: string): string[] {
  const model = parseSequenceDiagram(chart)
  return model.events
    .filter((event) => event.kind === "message" || event.kind === "note")
    .map((event) => event.explanation ?? "")
}

export interface JourneyPlayerProps extends Omit<SequenceLayoutOptions, "animateIn"> {
  slides: JourneySlide[]
  className?: string
  /** Height of the diagram viewport. Defaults to 420px. */
  height?: number
  /** Fixed dwell time per slide during autoplay. */
  autoPlayIntervalMs?: number
}

const MIN_DWELL_MS = 2600
const MAX_DWELL_MS = 7000
const MS_PER_CAPTION_CHAR = 30

function dwellTimeFor(slide: JourneySlide, speed: number, override?: number) {
  const base =
    override ??
    (slide.caption
      ? Math.min(
          MAX_DWELL_MS,
          Math.max(MIN_DWELL_MS, MIN_DWELL_MS + slide.caption.length * MS_PER_CAPTION_CHAR),
        )
      : MIN_DWELL_MS)
  return base * speed
}

/**
 * Plays a sequence of diagrams as a focused journey. The player intentionally
 * owns only navigation/playback controls; editing, themes, source format, and
 * other authoring UI belong to the parent experience.
 */
export function JourneyPlayer({
  slides,
  className,
  height = 420,
  columnGap,
  messageGap,
  showBottomActors,
  autoPlayIntervalMs,
  speed = 1,
}: JourneyPlayerProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [looping, setLooping] = useState(false)
  const [captionIndex, setCaptionIndex] = useState(-1)
  const [copied, setCopied] = useState(false)

  const slide = slides[index]
  const atStart = index === 0
  const atEnd = index === slides.length - 1
  const canPlay = slides.length > 1

  const schedule = useMemo(
    () => (slide ? getStepSchedule(parseSequenceDiagram(slide.chart), speed) : { delays: [] }),
    [slide, speed],
  )

  const captions = useMemo(
    () => (slide ? slide.messageCaptions ?? captionsFromChart(slide.chart) : []),
    [slide],
  )
  const hasCaptions = captions.some((caption) => caption.length > 0)

  function goTo(next: number) {
    setPlaying(false)
    setIndex(Math.max(0, Math.min(slides.length - 1, next)))
  }

  function togglePlay() {
    if (!canPlay) return
    if (playing) {
      setPlaying(false)
      return
    }
    if (atEnd && !looping) setIndex(0)
    setPlaying(true)
  }

  async function handleCopy() {
    if (!slide) return
    try {
      await navigator.clipboard.writeText(slide.chart.trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API can be unavailable in insecure contexts.
    }
  }

  useEffect(() => {
    if (!playing || !slide) return

    const scheduleFloor =
      schedule.delays.length > 0 ? schedule.delays[schedule.delays.length - 1] + 1200 * speed : 0
    const dwell = Math.max(dwellTimeFor(slide, speed, autoPlayIntervalMs), scheduleFloor)

    if (atEnd) {
      if (!looping) {
        setPlaying(false)
        return
      }
      const id = window.setTimeout(() => setIndex(0), dwell)
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => setIndex((current) => current + 1), dwell)
    return () => window.clearTimeout(id)
  }, [playing, looping, atEnd, slide, speed, autoPlayIntervalMs, schedule])

  useEffect(() => {
    setCaptionIndex(-1)
    if (!hasCaptions) return
    const count = Math.min(captions.length, schedule.delays.length)
    const timers = Array.from({ length: count }, (_, caption) =>
      window.setTimeout(() => setCaptionIndex(caption), schedule.delays[caption]),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [slide, captions, hasCaptions, schedule])

  useEffect(() => {
    setCopied(false)
  }, [slide])

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goTo(index + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goTo(index - 1)
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault()
      togglePlay()
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
        <div className="flex min-w-0 flex-col gap-0.5">
          {slide.title ? (
            <span className="truncate text-sm font-medium text-foreground">{slide.title}</span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            Step {index + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Journey steps">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-label={`Go to step ${itemIndex + 1}${item.title ? `: ${item.title}` : ""}`}
                onClick={() => goTo(itemIndex)}
                className={cn(
                  "size-1.5 transition-colors",
                  itemIndex === index ? "bg-primary" : "bg-border hover:bg-muted-foreground",
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
              className="flex items-center justify-center border-r border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next step"
              disabled={atEnd}
              onClick={() => goTo(index + 1)}
              className="flex items-center justify-center border-r border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
            {canPlay ? (
              <button
                type="button"
                aria-label={playing ? "Pause journey" : "Play journey"}
                aria-pressed={playing}
                onClick={togglePlay}
                className="flex items-center justify-center border-r border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
            ) : null}
            <button
              type="button"
              aria-label={looping ? "Disable autoplay loop" : "Enable autoplay loop"}
              aria-pressed={looping}
              onClick={() => setLooping((value) => !value)}
              className={cn(
                "flex items-center justify-center border-r border-border p-1.5 transition-colors",
                looping ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Repeat2 className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={copied ? "Copied current diagram" : "Copy current diagram"}
              onClick={handleCopy}
              className="flex items-center justify-center p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border border-border bg-card" style={{ height }}>
        <SequenceDiagram
          key={slide.id}
          chart={slide.chart}
          className="size-full"
          animateIn
          speed={speed}
          columnGap={columnGap}
          messageGap={messageGap}
          showBottomActors={showBottomActors}
        />
      </div>

      {hasCaptions ? (
        <div
          key={`${slide.id}-live-caption`}
          aria-live="polite"
          className="flex min-h-10 items-center border border-border bg-muted px-3 py-2"
        >
          {captionIndex >= 0 && captions[captionIndex] ? (
            <p key={captionIndex} className="seq-enter text-sm leading-relaxed text-foreground">
              <span className="mr-2 text-xs font-medium tabular-nums text-seq-accent">
                {captionIndex + 1}/{captions.length}
              </span>
              {captions[captionIndex]}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Watch the diagram to follow along…</p>
          )}
        </div>
      ) : null}

      {slide.caption ? (
        <p
          key={slide.id}
          className="seq-enter border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {slide.caption}
        </p>
      ) : null}
    </div>
  )
}
