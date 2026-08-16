"use client"

import { type CSSProperties, useRef, useState } from "react"
import { Download, ImageDown, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SequenceDiagram,
  type SequenceDiagramHandle,
} from "@/components/ui/sequence-diagram"

import { getContrastColor } from "./color-utils"
import { downloadTextFile, minifyMermaid } from "./minify-mermaid"
import { examples } from "./examples"

type ColorKey = "accent" | "activation" | "lifeline" | "background"

const COLOR_FIELDS: { key: ColorKey; label: string; defaultValue: string }[] = [
  { key: "accent", label: "Accent", defaultValue: "#c1440e" },
  { key: "activation", label: "Activation", defaultValue: "#f0dcd2" },
  { key: "lifeline", label: "Lifeline", defaultValue: "#b3b3b3" },
  { key: "background", label: "Background", defaultValue: "#ffffff" },
]

type ExampleId = (typeof examples)[number]["id"]

export function Playground() {
  const [activeId, setActiveId] = useState<ExampleId>(examples[0].id)
  const active = examples.find((e) => e.id === activeId) ?? examples[0]
  const [chart, setChart] = useState<string>(active.chart)
  const [colors, setColors] = useState<Partial<Record<ColorKey, string>>>({})
  const diagramRef = useRef<SequenceDiagramHandle>(null)

  function selectExample(id: (typeof examples)[number]["id"]) {
    const next = examples.find((e) => e.id === id) ?? examples[0]
    setActiveId(id)
    setChart(next.chart)
  }

  function setColor(key: ColorKey, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  function resetColors() {
    setColors({})
  }

  function handleDownloadCode() {
    downloadTextFile("diagram.mmd", minifyMermaid(chart))
  }

  async function handleDownloadImage() {
    await diagramRef.current?.exportPng("diagram.png")
  }

  const diagramStyle: CSSProperties = {
    ...(colors.accent
      ? {
          ["--seq-accent" as string]: colors.accent,
          ["--seq-accent-foreground" as string]: getContrastColor(colors.accent),
        }
      : {}),
    ...(colors.activation ? { ["--seq-activation" as string]: colors.activation } : {}),
    ...(colors.lifeline ? { ["--seq-lifeline" as string]: colors.lifeline } : {}),
    ...(colors.background
      ? {
          ["--background" as string]: colors.background,
          ["--card" as string]: colors.background,
          ["--foreground" as string]: getContrastColor(colors.background),
          ["--card-foreground" as string]: getContrastColor(colors.background),
        }
      : {}),
  }

  const hasCustomColors = Object.keys(colors).length > 0

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => selectExample(example.id)}
              className={cn(
                "border px-3 py-1.5 text-xs font-medium transition-colors",
                example.id === activeId
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {example.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              diagram.mmd
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Paste your own Mermaid
            </span>
          </div>
          <textarea
            value={chart}
            onChange={(event) => setChart(event.target.value)}
            spellCheck={false}
            aria-label="Sequence diagram source"
            className="min-h-[220px] flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Colors
            </span>
            {hasCustomColors ? (
              <button
                type="button"
                onClick={resetColors}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3" aria-hidden />
                Reset
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_FIELDS.map((field) => (
              <label
                key={field.key}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span className="relative flex size-8 items-center justify-center border border-border">
                  <input
                    type="color"
                    aria-label={`${field.label} color`}
                    value={colors[field.key] ?? field.defaultValue}
                    onChange={(event) => setColor(field.key, event.target.value)}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                  <span
                    className="pointer-events-none size-5"
                    style={{ backgroundColor: colors[field.key] ?? "transparent" }}
                    aria-hidden
                  />
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {field.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadCode}
            className="flex items-center justify-center gap-2 border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="size-3.5" aria-hidden />
            Download .mmd
          </button>
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-2 border border-transparent bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            <ImageDown className="size-3.5" aria-hidden />
            Download PNG
          </button>
        </div>
      </div>

      <div
        style={diagramStyle}
        className="h-[440px] overflow-hidden border border-border bg-background lg:h-auto lg:min-h-[440px]"
      >
        <SequenceDiagram ref={diagramRef} chart={chart} className="size-full" />
      </div>
    </div>
  )
}
