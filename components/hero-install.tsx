"use client"

import { useEffect, useState } from "react"
import { Check, Copy, FileCode2, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"

const RESET_DELAY_MS = 1800
const COMPONENT_COMMAND = "npx shadcn@latest add canadian-ai/sequence-flow/sequence-diagram"
const SKILL_COMMAND = "npx skills add canadian-ai/sequence-flow --skill sequence-diagram"
type Mode = "component" | "skill"

export function HeroInstall() {
  const [mode, setMode] = useState<Mode>("skill")
  const [copied, setCopied] = useState(false)
  const command = mode === "component" ? COMPONENT_COMMAND : SKILL_COMMAND

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), RESET_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyCommand() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Install</span>
        <div role="tablist" aria-label="Install type" className="grid grid-cols-2 border border-border">
          {(["skill", "component"] as const).map((item) => (
            <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => { setMode(item); setCopied(false) }} className={cn("min-h-9 px-3 text-xs font-medium capitalize transition-colors", mode === item ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{item === "skill" ? "Agent skill" : "Component"}</button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden border border-border bg-card">
        <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground sm:text-sm">{command}</code>
          <button type="button" onClick={copyCommand} className="inline-flex min-h-9 shrink-0 items-center gap-2 border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary" aria-label="Copy install command">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground sm:px-4">
          <FileCode2 className="size-4 shrink-0" aria-hidden />
          <span>{mode === "skill" ? "One universal skills.sh command. Your compatible agent discovers the installed skill automatically." : "Installs the React component from the public Canadian AI shadcn registry."}</span>
        </div>
      </div>
    </div>
  )
}
