"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy, Download, Pause, Play, Search } from "lucide-react"

import { downloadJourneyHtml, JourneyPlayer } from "@/components/ui/sequence-diagram"
import { cn } from "@/lib/utils"
import { journeyCatalog, type JourneyKind } from "./journey-catalog-data"

export function JourneyCatalog({ hero = false }: { hero?: boolean }) {
  const [kind, setKind] = useState<JourneyKind | "All">("All")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(journeyCatalog[0].id)
  const [copied, setCopied] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const examples = useMemo(() => journeyCatalog.filter((item) => (kind === "All" || item.kind === kind) && `${item.title} ${item.industry} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [kind, query])
  const active = examples.find((item) => item.id === selected) ?? examples[0] ?? journeyCatalog[0]

  const advanceUseCase = useCallback(() => {
    const current = examples.findIndex((item) => item.id === active.id)
    const next = examples[(current + 1) % examples.length]
    if (next) setSelected(next.id)
  }, [active.id, examples])

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(id)
    window.setTimeout(() => setCopied(null), 1500)
  }

  return <div className={cn("grid min-w-0 border border-border shadow-[0_24px_80px_-48px_hsl(var(--foreground))] lg:grid-cols-[340px_minmax(0,1fr)]", hero && "lg:grid-cols-[300px_minmax(0,1fr)]")}>
    <div className="flex min-w-0 flex-col border-b border-border bg-card lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <label className="flex items-center gap-2 border border-border bg-background px-3"><Search className="size-4 text-muted-foreground" aria-hidden /><span className="sr-only">Search journeys</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search use cases" className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
        <div className="grid grid-cols-3 border border-border" role="group" aria-label="Journey category">{(["All", "Business", "Technical"] as const).map((item) => <button key={item} type="button" aria-pressed={kind === item} onClick={() => setKind(item)} className={cn("min-h-9 px-2 text-xs font-medium", kind === item ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>{item}</button>)}</div>
      </div>
      <div className={cn("overflow-auto", hero ? "max-h-[560px]" : "max-h-[520px]")}>
        {examples.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={cn("flex w-full flex-col gap-1 border-b border-border p-4 text-left", active.id === item.id ? "bg-secondary" : "hover:bg-secondary/70")}><span className="flex w-full items-center justify-between gap-3"><strong className="text-sm">{item.title}</strong><span className="font-mono text-[10px] uppercase text-muted-foreground">{item.kind}</span></span><span className="text-xs text-muted-foreground">{item.industry} · {item.slides.length} stages</span></button>)}
      </div>
    </div>
    <div className="flex min-w-0 flex-col gap-4 bg-background p-3 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex max-w-2xl flex-col gap-1"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{active.industry} / {active.kind}</span><h3 className="font-serif text-2xl font-bold">{active.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{active.summary}</p></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate} className={cn("inline-flex min-h-10 items-center justify-center gap-2 border border-border px-3 text-xs font-medium", autoRotate ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>{autoRotate ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}{autoRotate ? "Autoplay on" : "Autoplay off"}</button><button type="button" onClick={() => downloadJourneyHtml(active.slides, { title: active.title })} className="inline-flex min-h-10 items-center justify-center gap-2 border border-border px-3 text-xs font-medium hover:bg-secondary"><Download className="size-4" aria-hidden />Export HTML</button></div></div>
      <JourneyPlayer key={active.id} slides={active.slides} height={hero ? 410 : 360} autoPlay={autoRotate} loop={false} onComplete={autoRotate ? advanceUseCase : undefined} />
      <div className="border border-border bg-card"><div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2"><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Architecture prompt</span><button type="button" onClick={() => copy(active.id, active.command)} className="inline-flex min-h-8 items-center gap-2 px-2 text-xs font-medium hover:bg-secondary">{copied === active.id ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{copied === active.id ? "Copied" : "Copy prompt"}</button></div><p className="p-3 font-mono text-xs leading-relaxed text-muted-foreground">{active.command}</p></div>
    </div>
  </div>
}
