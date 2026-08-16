"use client"

import { type CSSProperties, useRef, useState } from "react"
import { Check, Download, ImageDown, Moon, RotateCcw, SlidersHorizontal, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SequenceDiagram,
  type SequenceDiagramHandle,
} from "@/components/ui/sequence-diagram"

import { getContrastColor } from "./color-utils"
import { downloadTextFile, minifyMermaid } from "./minify-mermaid"
import { examples } from "./examples"
import { CUSTOM_THEME_ID, DEFAULT_THEME, THEMES, type ColorMode, type ThemeColors } from "./themes"

type ColorKey = keyof ThemeColors

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
  { key: "accent", label: "Accent" },
  { key: "activation", label: "Activation" },
  { key: "lifeline", label: "Lifeline" },
  { key: "background", label: "Background" },
]

type ExampleId = (typeof examples)[number]["id"]

export function Playground() {
  const [activeId, setActiveId] = useState<ExampleId>(examples[0].id)
  const active = examples.find((e) => e.id === activeId) ?? examples[0]
  const [chart, setChart] = useState<string>(active.chart)
  const [mode, setMode] = useState<ColorMode>("light")
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME.id)
  const [colors, setColors] = useState<Partial<Record<ColorKey, string>>>({})
  const diagramRef = useRef<SequenceDiagramHandle>(null)

  const isCustom = themeId === CUSTOM_THEME_ID
  const activeTheme = THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME
  // Custom mode starts from the Default theme's palette for this mode, then
  // layers any individually-picked colors on top.
  const baseColors = isCustom ? DEFAULT_THEME[mode] : activeTheme[mode]
  const resolvedColors: ThemeColors = isCustom ? { ...baseColors, ...colors } : baseColors

  function selectExample(id: (typeof examples)[number]["id"]) {
    const next = examples.find((e) => e.id === id) ?? examples[0]
    setActiveId(id)
    setChart(next.chart)
  }

  function selectTheme(id: string) {
    setThemeId(id)
    setColors({})
  }

  function setColor(key: ColorKey, value: string) {
    setThemeId(CUSTOM_THEME_ID)
    setColors((prev) => ({ ...prev, [key]: value }))
  }

  function resetColors() {
    setThemeId(DEFAULT_THEME.id)
    setColors({})
    setMode("light")
  }

  function handleDownloadCode() {
    downloadTextFile("diagram.mmd", minifyMermaid(chart))
  }

  async function handleDownloadImage() {
    await diagramRef.current?.exportPng("diagram.png")
  }

  const diagramStyle: CSSProperties = {
    ["--seq-accent" as string]: resolvedColors.accent,
    ["--seq-accent-foreground" as string]: getContrastColor(resolvedColors.accent),
    ["--seq-activation" as string]: resolvedColors.activation,
    ["--seq-lifeline" as string]: resolvedColors.lifeline,
    ["--background" as string]: resolvedColors.background,
    ["--card" as string]: resolvedColors.background,
    ["--foreground" as string]: getContrastColor(resolvedColors.background),
    ["--card-foreground" as string]: getContrastColor(resolvedColors.background),
  }

  const hasCustomization = themeId !== DEFAULT_THEME.id || mode !== "light"

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
              Theme
            </span>
            <div className="flex items-center gap-2">
              {hasCustomization ? (
                <button
                  type="button"
                  onClick={resetColors}
                  className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Reset
                </button>
              ) : null}
              <div
                role="group"
                aria-label="Preview color mode"
                className="flex border border-border"
              >
                {(["light", "dark"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                      mode === m
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "light" ? (
                      <Sun className="size-3" aria-hidden />
                    ) : (
                      <Moon className="size-3" aria-hidden />
                    )}
                    <span className="sr-only">{m} mode</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {THEMES.map((theme) => {
              const swatch = theme[mode]
              const selected = themeId === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectTheme(theme.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex flex-col items-center gap-1.5 border p-1.5 transition-colors",
                    selected ? "border-foreground" : "border-border hover:border-muted-foreground",
                  )}
                >
                  <span
                    className="relative flex h-6 w-full items-center justify-center gap-0.5 border border-border"
                    style={{ backgroundColor: swatch.background }}
                  >
                    <span
                      className="size-2"
                      style={{ backgroundColor: swatch.accent }}
                      aria-hidden
                    />
                    <span
                      className="size-2 border"
                      style={{ backgroundColor: swatch.activation, borderColor: swatch.lifeline }}
                      aria-hidden
                    />
                    <span
                      className="size-2"
                      style={{ backgroundColor: swatch.lifeline }}
                      aria-hidden
                    />
                    {selected ? (
                      <Check
                        className="absolute -right-1 -top-1 size-3 rounded-full bg-foreground p-0.5 text-background"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{theme.label}</span>
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setThemeId(CUSTOM_THEME_ID)}
              aria-pressed={isCustom}
              className={cn(
                "flex flex-col items-center gap-1.5 border p-1.5 transition-colors",
                isCustom ? "border-foreground" : "border-border hover:border-muted-foreground",
              )}
            >
              <span
                className="relative flex h-6 w-full items-center justify-center border border-dashed border-border"
                style={{ backgroundColor: resolvedColors.background }}
              >
                <SlidersHorizontal className="size-3 text-muted-foreground" aria-hidden />
                {isCustom ? (
                  <Check
                    className="absolute -right-1 -top-1 size-3 rounded-full bg-foreground p-0.5 text-background"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="text-[10px] text-muted-foreground">Custom</span>
            </button>
          </div>

          {isCustom ? (
            <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
              {COLOR_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <span className="relative flex size-8 items-center justify-center border border-border">
                    <input
                      type="color"
                      aria-label={`${field.label} color`}
                      value={colors[field.key] ?? baseColors[field.key]}
                      onChange={(event) => setColor(field.key, event.target.value)}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                    <span
                      className="pointer-events-none size-5"
                      style={{ backgroundColor: colors[field.key] ?? baseColors[field.key] }}
                      aria-hidden
                    />
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          ) : null}
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
