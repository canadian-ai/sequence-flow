"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Download, Search } from "lucide-react"

import { downloadJourneyHtml, JourneyPlayer } from "@/components/ui/sequence-diagram"
import { cn } from "@/lib/utils"

import { journeyCatalog, type JourneyKind } from "./journey-catalog-data"

export function JourneyCatalog() {
  const [kind, setKind] = useState<JourneyKind | "All">("All")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(journeyCatalog[0].id)
  const [copied, setCopied] = useState<string | null>(null)
  const examples = useMemo(() => journeyCatalog.filter((item) => (kind === "All" || item.kind === kind) && `${item.title} ${item.industry} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [kind, query])
  const active = examples.find((item) => item.id === selected) ?? examples[0] ?? journeyCatalog[0]

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(id)
    window.setTimeout(() => setCopied(null), 1500)
  }

  return <div className="grid min-w-0 border border-border lg:grid-cols-[360px_minmax(0,1fr)]">
    <div className="flex min-w-0 flex-col border-b border-border bg-card lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <label className="flex items-center gap-2 border border-border bg-background px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">Search journeys</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search use cases" className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="grid grid-cols-3 border border-border" role="group" aria-label="Journey category">
          {(["All", "Business", "Technical"] as const).map((item) => <button key={item} type="button" aria-pressed={kind === item} onClick={() => setKind(item)} className={cn("min-h-9 px-2 text-xs font-medium", kind === item ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>{item}</button>)}
        </div>
      </div>
      <div className="max-h-[520px] overflow-auto">
        {examples.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={cn("flex w-full flex-col gap-1 border-b border-border p-4 text-left", active.id === item.id ? "bg-secondary" : "hover:bg-secondary/70")}>
          <span className="flex w-full items-center justify-between gap-3"><strong className="text-sm">{item.title}</strong><span className="font-mono text-[10px] uppercase text-muted-foreground">{item.kind}</span></span>
          <span className="text-xs text-muted-foreground">{item.industry} · {item.slides.length} steps</span>
        </button>)}
      </div>
    </div>
    <div className="flex min-w-0 flex-col gap-4 bg-background p-3 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-1"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{active.industry} / {active.kind}</span><h3 className="font-serif text-2xl font-bold">{active.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{active.summary}</p></div>
        <button type="button" onClick={() => downloadJourneyHtml(active.slides, { title: active.title })} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border border-border px-3 text-xs font-medium hover:bg-secondary"><Download className="size-4" aria-hidden />Export HTML</button>
      </div>
      <JourneyPlayer slides={active.slides} height={360} />
      <div className="border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2"><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Architecture command</span><button type="button" onClick={() => copy(active.id, active.command)} className="inline-flex min-h-8 items-center gap-2 px-2 text-xs font-medium hover:bg-secondary">{copied === active.id ? <Check className="size-4" /> : <Copy className="size-4" />}{copied === active.id ? "Copied" : "Copy command"}</button></div>
        <p className="p-3 font-mono text-xs leading-relaxed text-muted-foreground">{active.command}</p>
      </div>
    </div>
  </div>
}
