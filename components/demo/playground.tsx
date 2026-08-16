"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { SequenceDiagram } from "@/components/ui/sequence-diagram"

import { examples } from "./examples"

export function Playground() {
  const [activeId, setActiveId] = useState(examples[0].id)
  const active = examples.find((e) => e.id === activeId) ?? examples[0]
  const [chart, setChart] = useState(active.chart)

  function selectExample(id: (typeof examples)[number]["id"]) {
    const next = examples.find((e) => e.id === id) ?? examples[0]
    setActiveId(id)
    setChart(next.chart)
  }

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
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                example.id === activeId
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {example.label}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              diagram.mmd
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Mermaid syntax
            </span>
          </div>
          <textarea
            value={chart}
            onChange={(event) => setChart(event.target.value)}
            spellCheck={false}
            aria-label="Sequence diagram source"
            className="min-h-[280px] flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-foreground outline-none"
          />
        </div>
      </div>

      <div className="h-[440px] overflow-hidden rounded-lg border border-border bg-card lg:h-auto lg:min-h-[440px]">
        <SequenceDiagram chart={chart} className="size-full" />
      </div>
    </div>
  )
}
