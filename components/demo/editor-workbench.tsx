"use client"

import { useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"

import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"
import { cn } from "@/lib/utils"

import { architectureJourney } from "./journeys"
import { Playground } from "./playground"

const tabs = [
  { id: "sequence", label: "Sequence flow" },
  { id: "journey", label: "Journey" },
] as const

type TabId = (typeof tabs)[number]["id"]

const initialJourney = JSON.stringify(architectureJourney, null, 2)

function buildJourneyCode(slides: JourneySlide[]) {
  return `import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"\n\nconst journey: JourneySlide[] = ${JSON.stringify(
    slides,
    null,
    2,
  )}\n\nexport function JourneyExample() {\n  return <JourneyPlayer slides={journey} />\n}`
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">component.tsx</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 items-center gap-2 border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function JourneyEditor() {
  const [source, setSource] = useState(initialJourney)
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
        <div className="overflow-hidden border border-border bg-card p-2 sm:p-3">
          <JourneyPlayer slides={parsed.slides} height={460} />
        </div>
        <CodeBlock code={buildJourneyCode(parsed.slides)} />
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
        {tab === "sequence" ? <Playground /> : <JourneyEditor />}
      </div>
    </div>
  )
}
