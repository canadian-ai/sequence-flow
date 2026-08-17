"use client"

import { type CSSProperties, useMemo, useState } from "react"
import { Check, Copy, Moon, Sun } from "lucide-react"

import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"
import { cn } from "@/lib/utils"

import { getContrastColor } from "./color-utils"
import { architectureJourney } from "./journeys"
import { Playground } from "./playground"
import { DEFAULT_THEME, THEMES, type ColorMode } from "./themes"

const tabs = [
  { id: "sequence", label: "Sequence flow" },
  { id: "journey", label: "Journey" },
] as const

type TabId = (typeof tabs)[number]["id"]

const initialJourney = JSON.stringify(architectureJourney, null, 2)

const sequenceCode = `import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const chart = \`sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /products
  A-->>B: 200 OK\`

export function SequenceExample() {
  return (
    <div className="h-[400px]">
      <SequenceDiagram chart={chart} />
    </div>
  )
}`

function buildJourneyCode(slides: JourneySlide[], themeId: string, mode: ColorMode) {
  const theme = THEMES.find((item) => item.id === themeId) ?? DEFAULT_THEME
  const colors = theme[mode]

  return `import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"\n\nconst journey: JourneySlide[] = ${JSON.stringify(
    slides,
    null,
    2,
  )}\n\nexport function JourneyExample() {\n  return (\n    <div\n      style={{\n        \"--seq-accent\": \"${colors.accent}\",\n        \"--seq-accent-foreground\": \"${getContrastColor(colors.accent)}\",\n        \"--seq-activation\": \"${colors.activation}\",\n        \"--seq-lifeline\": \"${colors.lifeline}\",\n        \"--background\": \"${colors.background}\",\n        \"--card\": \"${colors.background}\",\n      } as React.CSSProperties}\n    >\n      <JourneyPlayer slides={journey} />\n    </div>\n  )\n}`
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="min-w-0 overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">component.tsx</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 shrink-0 items-center gap-2 border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="max-h-[420px] max-w-full overflow-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function JourneyThemePicker({
  themeId,
  mode,
  onThemeChange,
  onModeChange,
}: {
  themeId: string
  mode: ColorMode
  onThemeChange: (themeId: string) => void
  onModeChange: (mode: ColorMode) => void
}) {
  return (
    <div className="space-y-3 border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Journey theme</p>
          <p className="mt-1 text-xs text-muted-foreground">Preview the full walkthrough with a shared palette.</p>
        </div>
        <div role="group" aria-label="Journey color mode" className="flex border border-border">
          {(["light", "dark"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => onModeChange(item)}
              className={cn(
                "flex min-h-9 items-center gap-1.5 px-3 text-xs font-medium transition-colors",
                mode === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item === "light" ? <Sun className="size-3.5" aria-hidden /> : <Moon className="size-3.5" aria-hidden />}
              <span className="capitalize">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {THEMES.map((theme) => {
          const colors = theme[mode]
          const selected = theme.id === themeId

          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                "min-w-0 border p-2 text-left transition-colors",
                selected ? "border-foreground" : "border-border hover:border-muted-foreground",
              )}
            >
              <span
                className="mb-2 flex h-8 items-center justify-center gap-1 border border-border"
                style={{ backgroundColor: colors.background }}
              >
                <span className="h-4 w-7" style={{ backgroundColor: colors.accent }} aria-hidden />
                <span
                  className="h-4 w-7 border"
                  style={{ backgroundColor: colors.activation, borderColor: colors.lifeline }}
                  aria-hidden
                />
              </span>
              <span className="flex items-center justify-between gap-2 text-xs font-medium">
                <span className="truncate">{theme.label}</span>
                {selected ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function JourneyEditor() {
  const [source, setSource] = useState(initialJourney)
  const [themeId, setThemeId] = useState(DEFAULT_THEME.id)
  const [mode, setMode] = useState<ColorMode>("light")

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(source) as JourneySlide[]
      if (!Array.isArray(value)) throw new Error("Journey must be an array of slides.")
      return { slides: value, error: null as string | null }
    } catch (error) {
      return {
        slides: architectureJourney,
        error: error instanceof Error ? error.message : "Invalid journey JSON",
      }
    }
  }, [source])

  const activeTheme = THEMES.find((theme) => theme.id === themeId) ?? DEFAULT_THEME
  const colors = activeTheme[mode]
  const journeyStyle: CSSProperties = {
    ["--seq-accent" as string]: colors.accent,
    ["--seq-accent-foreground" as string]: getContrastColor(colors.accent),
    ["--seq-activation" as string]: colors.activation,
    ["--seq-lifeline" as string]: colors.lifeline,
    ["--background" as string]: colors.background,
    ["--card" as string]: colors.background,
    ["--foreground" as string]: getContrastColor(colors.background),
    ["--card-foreground" as string]: getContrastColor(colors.background),
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">journey.json</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Pass an array of JourneySlide objects
            </span>
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            aria-label="Journey source"
            className="min-h-[360px] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground outline-none sm:min-h-[420px] lg:min-h-[560px]"
          />
          {parsed.error ? (
            <p className="border-t border-border px-3 py-2 text-xs text-destructive">
              {parsed.error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <JourneyThemePicker
          themeId={themeId}
          mode={mode}
          onThemeChange={setThemeId}
          onModeChange={setMode}
        />
        <div
          style={journeyStyle}
          className="min-w-0 overflow-hidden border border-border bg-background p-2 sm:p-3"
        >
          <JourneyPlayer slides={parsed.slides} height={460} />
        </div>
        <CodeBlock code={buildJourneyCode(parsed.slides, themeId, mode)} />
      </div>
    </div>
  )
}

export function EditorWorkbench() {
  const [tab, setTab] = useState<TabId>("sequence")

  return (
    <div className="min-w-0 space-y-4">
      <div
        role="tablist"
        aria-label="Editor type"
        className="grid w-full grid-cols-2 border border-border sm:flex sm:w-fit"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 px-4 text-sm font-medium transition-colors sm:min-w-36",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-w-0">
        {tab === "sequence" ? (
          <div className="min-w-0 space-y-4">
            <Playground />
            <CodeBlock code={sequenceCode} />
          </div>
        ) : (
          <JourneyEditor />
        )}
      </div>
    </div>
  )
}
