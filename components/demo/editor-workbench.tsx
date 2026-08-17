"use client"

import { type CSSProperties, useMemo, useState } from "react"
import { Check, Copy, Moon, Sun } from "lucide-react"

import {
  JourneyPlayer,
  parseJourneyMarkdown,
  type JourneySlide,
} from "@/components/ui/sequence-diagram"
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
type JourneyFormat = "markdown" | "json"

const initialJourneyJson = JSON.stringify(architectureJourney, null, 2)
const initialJourneyMarkdown = `# Request lifecycle

A progressive walkthrough authored as Markdown. Each \`##\` heading is a slide.

## Step 1 — Request
<!-- @id: request -->
<!-- @message: The browser sends the request to the API. -->
The browser begins the request lifecycle.

\`\`\`mermaid
sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /products
\`\`\`

## Step 2 — Response
<!-- @id: response -->
<!-- @message: The browser sends the request to the API. -->
<!-- @message: The API returns the product payload. -->
The response completes the round trip.

\`\`\`mermaid
sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /products
  A-->>B: 200 OK
\`\`\``

const sequenceCode = `import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const chart = \`sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /products
  A-->>B: 200 OK\`

export function SequenceExample() {
  return <div className="h-[400px]"><SequenceDiagram chart={chart} /></div>
}`

function buildJourneyCode(slides: JourneySlide[], themeId: string, mode: ColorMode) {
  const theme = THEMES.find((item) => item.id === themeId) ?? DEFAULT_THEME
  const colors = theme[mode]
  return `import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"\n\nconst journey: JourneySlide[] = ${JSON.stringify(slides, null, 2)}\n\nexport function JourneyExample() {\n  return (\n    <div style={{\n      "--seq-accent": "${colors.accent}",\n      "--seq-accent-foreground": "${getContrastColor(colors.accent)}",\n      "--seq-activation": "${colors.activation}",\n      "--seq-lifeline": "${colors.lifeline}",\n      "--background": "${colors.background}",\n      "--card": "${colors.background}",\n    } as React.CSSProperties}>\n      <JourneyPlayer slides={journey} />\n    </div>\n  )\n}`
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return <div className="min-w-0 overflow-hidden border border-border bg-card">
    <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
      <span className="font-mono text-xs text-muted-foreground">component.tsx</span>
      <button type="button" onClick={copy} className="inline-flex min-h-9 shrink-0 items-center gap-2 border border-border px-3 text-xs font-medium hover:bg-secondary">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy code"}
      </button>
    </div>
    <pre className="max-h-[420px] max-w-full overflow-auto p-4 text-xs leading-relaxed"><code>{code}</code></pre>
  </div>
}

function JourneyThemePicker({ themeId, mode, onThemeChange, onModeChange }: { themeId: string; mode: ColorMode; onThemeChange: (value: string) => void; onModeChange: (value: ColorMode) => void }) {
  return <div className="space-y-3 border border-border bg-card p-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Journey theme</p><p className="mt-1 text-xs text-muted-foreground">Preview the full walkthrough with a shared palette.</p></div>
      <div role="group" aria-label="Journey color mode" className="flex border border-border">
        {(["light", "dark"] as const).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => onModeChange(item)} className={cn("flex min-h-9 items-center gap-1.5 px-3 text-xs font-medium", mode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{item === "light" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}<span className="capitalize">{item}</span></button>)}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {THEMES.map((theme) => { const colors = theme[mode]; const selected = theme.id === themeId; return <button key={theme.id} type="button" aria-pressed={selected} onClick={() => onThemeChange(theme.id)} className={cn("min-w-0 border p-2 text-left", selected ? "border-foreground" : "border-border hover:border-muted-foreground")}><span className="mb-2 flex h-8 items-center justify-center gap-1 border border-border" style={{ backgroundColor: colors.background }}><span className="h-4 w-7" style={{ backgroundColor: colors.accent }} /><span className="h-4 w-7 border" style={{ backgroundColor: colors.activation, borderColor: colors.lifeline }} /></span><span className="flex items-center justify-between gap-2 text-xs font-medium"><span className="truncate">{theme.label}</span>{selected ? <Check className="size-3.5" /> : null}</span></button> })}
    </div>
  </div>
}

function JourneyEditor() {
  const [format, setFormat] = useState<JourneyFormat>("markdown")
  const [markdown, setMarkdown] = useState(initialJourneyMarkdown)
  const [json, setJson] = useState(initialJourneyJson)
  const [themeId, setThemeId] = useState(DEFAULT_THEME.id)
  const [mode, setMode] = useState<ColorMode>("light")
  const source = format === "markdown" ? markdown : json
  const setSource = format === "markdown" ? setMarkdown : setJson

  const parsed = useMemo(() => {
    try {
      if (format === "markdown") return { slides: parseJourneyMarkdown(markdown).slides, error: null as string | null }
      const value = JSON.parse(json) as JourneySlide[]
      if (!Array.isArray(value)) throw new Error("Journey must be an array of slides.")
      return { slides: value, error: null as string | null }
    } catch (error) {
      return { slides: architectureJourney, error: error instanceof Error ? error.message : `Invalid journey ${format}` }
    }
  }, [format, json, markdown])

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

  return <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
    <div className="min-w-0 space-y-4">
      <div className="overflow-hidden border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex border border-border" role="group" aria-label="Journey source format">
            {(["markdown", "json"] as const).map((item) => <button key={item} type="button" aria-pressed={format === item} onClick={() => setFormat(item)} className={cn("min-h-9 px-3 text-xs font-medium capitalize", format === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{item}</button>)}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{format === "markdown" ? "## slide + annotations + mermaid" : "JourneySlide[]"}</span>
        </div>
        <textarea value={source} onChange={(event) => setSource(event.target.value)} spellCheck={false} aria-label={`Journey ${format} source`} className="min-h-[420px] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground outline-none lg:min-h-[620px]" />
        {parsed.error ? <p className="border-t border-border px-3 py-2 text-xs text-destructive">{parsed.error}</p> : null}
      </div>
      {format === "markdown" ? <div className="border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Markdown annotations:</strong> use <code>##</code> for each slide, <code>&lt;!-- @id: ... --&gt;</code> for stable IDs, and repeated <code>&lt;!-- @message: ... --&gt;</code> comments for per-message narration. Put each diagram in a <code>mermaid</code> fence.</div> : null}
    </div>
    <div className="min-w-0 space-y-4">
      <JourneyThemePicker themeId={themeId} mode={mode} onThemeChange={setThemeId} onModeChange={setMode} />
      <div style={journeyStyle} className="min-w-0 overflow-hidden border border-border bg-background p-2 sm:p-3"><JourneyPlayer slides={parsed.slides} height={460} /></div>
      <CodeBlock code={buildJourneyCode(parsed.slides, themeId, mode)} />
    </div>
  </div>
}

export function EditorWorkbench() {
  const [tab, setTab] = useState<TabId>("sequence")
  return <div className="min-w-0 space-y-4">
    <div role="tablist" aria-label="Editor type" className="grid w-full grid-cols-2 border border-border sm:flex sm:w-fit">{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={cn("min-h-11 px-4 text-sm font-medium sm:min-w-36", tab === item.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{item.label}</button>)}</div>
    <div role="tabpanel" className="min-w-0">{tab === "sequence" ? <div className="min-w-0 space-y-4"><Playground /><CodeBlock code={sequenceCode} /></div> : <JourneyEditor />}</div>
  </div>
}
