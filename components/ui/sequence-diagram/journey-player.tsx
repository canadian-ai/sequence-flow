"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronLeft, ChevronRight, Code2, Copy, Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

import { getStepTiming } from "./layout"
import { parseSequenceDiagram } from "./parser"
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
  /**
   * Optional per-edge commentary, e.g. ["The browser sends an HTTP GET
   * request.", "The server responds with a 200 OK and HTML."]. Aligned by
   * position to this chart's messages and notes in the order they appear
   * top-to-bottom — the same order they animate in. As each one reveals
   * during playback, its caption fades in below the diagram.
   *
   * Optional — when omitted, captions are read straight from the chart's own
   * `%% tooltip: text` annotations (see the sequence-diagram parser), so the
   * Mermaid source stays the single source of truth for both the hover
   * tooltip and the step-through caption. Only pass this to override that.
   */
  messageCaptions?: string[]
}

/**
 * Pull per-step captions straight out of a chart's own `%% tooltip: text`
 * annotations, in the same top-to-bottom order messages/notes animate in.
 * Falls back to an empty string for any step left un-annotated so indices
 * still line up with `stepCount`.
 */
function captionsFromChart(chart: string): string[] {
  const model = parseSequenceDiagram(chart)
  return model.events
    .filter((e) => e.kind === "message" || e.kind === "note")
    .map((e) => e.explanation ?? "")
}

export interface JourneyPlayerProps extends Omit<SequenceLayoutOptions, "animateIn" | "speed"> {
  slides: JourneySlide[]
  className?: string
  /** Height of the diagram viewport. Defaults to 420px. */
  height?: number
  /**
   * Fixed dwell time (ms) per slide during autoplay. When omitted, dwell
   * time is estimated from the slide's caption length so slides with more
   * commentary to read stay on screen longer. Scaled by the playback speed
   * control regardless.
   */
  autoPlayIntervalMs?: number
}

const MIN_DWELL_MS = 2600
const MAX_DWELL_MS = 7000
const MS_PER_CAPTION_CHAR = 30

const SPEEDS = [
  { label: "Fast", value: 0.6 },
  { label: "Normal", value: 1 },
  { label: "Slow", value: 2 },
] as const

/** Estimate how long a slide should stay on screen during autoplay, based on caption length. */
function dwellTimeFor(slide: JourneySlide, speed: number, override?: number) {
  const base =
    override ??
    (slide.caption
      ? Math.min(MAX_DWELL_MS, Math.max(MIN_DWELL_MS, MIN_DWELL_MS + slide.caption.length * MS_PER_CAPTION_CHAR))
      : MIN_DWELL_MS)
  return base * speed
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
  autoPlayIntervalMs,
}: JourneyPlayerProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(1)
  const [captionIndex, setCaptionIndex] = useState(-1)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const slide = slides[index]
  const atStart = index === 0
  const atEnd = index === slides.length - 1
  const canPlay = slides.length > 1

  // Number of steps (messages + notes, in the same order they're revealed)
  // in the current slide's chart, and the timing the diagram itself uses to
  // stagger them in — so the live caption below tracks the animation exactly
  // without duplicating layout.ts's schedule.
  const stepCount = useMemo(() => {
    const model = parseSequenceDiagram(slide.chart)
    return model.events.filter((e) => e.kind === "message" || e.kind === "note").length
  }, [slide.chart])
  const timing = useMemo(
    () => getStepTiming(parseSequenceDiagram(slide.chart).participants.length, speed),
    [slide.chart, speed],
  )
  // Prefer explicit `messageCaptions` when provided; otherwise read the
  // step-through commentary straight from the chart's own `%% tooltip:`
  // annotations, so a single Mermaid source drives both the hover tooltip
  // and the live caption.
  const captions = useMemo(
    () => slide.messageCaptions ?? captionsFromChart(slide.chart),
    [slide],
  )
  const hasCaptions = captions.some((c) => c.length > 0)
  const trimmedChart = useMemo(() => slide.chart.trim(), [slide.chart])

  /** Manual navigation (arrows, dots, keyboard) always stops autoplay. */
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
    // Replaying from a finished journey starts over from the top.
    if (atEnd) setIndex(0)
    setPlaying(true)
  }

  // Advance one slide per dwell period while playing; each advance remounts
  // the diagram (via `key={slide.id}` below) so the node entrance animation
  // replays for every step, exactly like clicking "next" manually.
  useEffect(() => {
    if (!playing) return
    if (index === slides.length - 1) {
      setPlaying(false)
      return
    }
    const dwell = dwellTimeFor(slides[index], speed, autoPlayIntervalMs)
    const id = setTimeout(() => {
      setIndex((i) => Math.min(slides.length - 1, i + 1))
    }, dwell)
    return () => clearTimeout(id)
  }, [playing, index, slides, speed, autoPlayIntervalMs])

  // Reveal each of this slide's captions in lockstep with its edge animating
  // in, so "the browser makes a request..." fades in right as that arrow
  // appears, then holds until the next one.
  useEffect(() => {
    setCaptionIndex(-1)
    if (!hasCaptions) return
    const count = Math.min(captions.length, stepCount)
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setCaptionIndex(i), timing.actorSettleDelay + i * timing.stepStaggerMs),
    )
    return () => timers.forEach(clearTimeout)
  }, [slide, captions, hasCaptions, stepCount, timing])

  // Copied state and code visibility are per-slide; jumping to a new step
  // shouldn't leave a stale "Copied!" checkmark showing.
  useEffect(() => {
    setCopied(false)
  }, [slide])

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(trimmedChart)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

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
          <div
            className="flex border border-border"
            role="radiogroup"
            aria-label="Playback speed"
          >
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={speed === s.value}
                aria-label={`${s.label} speed`}
                onClick={() => setSpeed(s.value)}
                className={cn(
                  "px-2 py-1.5 text-xs transition-colors",
                  s.value !== SPEEDS[SPEEDS.length - 1].value ? "border-r border-border" : undefined,
                  speed === s.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex border border-border">
            {canPlay ? (
              <button
                type="button"
                aria-label={playing ? "Pause" : atEnd ? "Replay journey" : "Play journey"}
                onClick={togglePlay}
                className="flex items-center justify-center border-r border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {playing ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
              </button>
            ) : null}
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
              className="flex items-center justify-center p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            aria-pressed={showCode}
            aria-label={showCode ? "Hide diagram code" : "Show diagram code"}
            onClick={() => setShowCode((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors",
              showCode
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Code2 className="size-3.5" aria-hidden />
            Code
          </button>
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
        {showCode ? (
          <div className="absolute inset-0 flex flex-col bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">
                {slide.id}.mmd
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className={cn(
                  "flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium transition-colors",
                  copied
                    ? "border-transparent bg-seq-accent text-seq-accent-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {copied ? (
                  <>
                    <Check className="size-3" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" aria-hidden />
                    Copy code
                  </>
                )}
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-3">
              <code className="font-mono text-xs leading-relaxed text-foreground">
                {trimmedChart}
              </code>
            </pre>
          </div>
        ) : null}
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
