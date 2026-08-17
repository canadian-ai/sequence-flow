"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Download, FileCode2, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"

const RESET_DELAY_MS = 1800
const COMPONENT_COMMAND =
  "npx shadcn@latest add https://sequence-flow.canadian-ai.app/r/sequence-diagram.json"
const SKILL_URL =
  "https://raw.githubusercontent.com/canadian-ai/sequence-flow/main/registry/skill/SKILL.md"

const agents = [
  {
    id: "claude",
    label: "Claude Code",
    path: ".claude/skills/sequence-diagram/SKILL.md",
  },
  {
    id: "codex",
    label: "Codex",
    path: ".agents/skills/sequence-diagram/SKILL.md",
  },
  {
    id: "opencode",
    label: "OpenCode",
    path: ".opencode/skills/sequence-diagram/SKILL.md",
  },
] as const

type Mode = "component" | "skill"
type AgentId = (typeof agents)[number]["id"]

function skillCommand(path: string) {
  const directory = path.slice(0, path.lastIndexOf("/"))
  return `mkdir -p ${directory} && curl -fsSL ${SKILL_URL} -o ${path}`
}

export function HeroInstall() {
  const [mode, setMode] = useState<Mode>("component")
  const [agent, setAgent] = useState<AgentId>("claude")
  const [copied, setCopied] = useState<string | null>(null)

  const selectedAgent = agents.find((item) => item.id === agent) ?? agents[0]
  const command = mode === "component" ? COMPONENT_COMMAND : skillCommand(selectedAgent.path)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(null), RESET_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyText(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
  }

  async function copySkillFile() {
    const response = await fetch(SKILL_URL)
    if (!response.ok) throw new Error("Unable to load SKILL.md")
    await copyText(await response.text(), "skill-file")
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Install
        </span>
        <div
          role="tablist"
          aria-label="Install type"
          className="grid grid-cols-2 border border-border sm:flex"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "component"}
            onClick={() => setMode("component")}
            className={cn(
              "min-h-9 px-3 text-xs font-medium transition-colors",
              mode === "component"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            Component
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "skill"}
            onClick={() => setMode("skill")}
            className={cn(
              "min-h-9 px-3 text-xs font-medium transition-colors",
              mode === "skill"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            Agent skill
          </button>
        </div>
      </div>

      {mode === "skill" ? (
        <div className="grid grid-cols-3 border border-border" role="tablist" aria-label="Coding agent">
          {agents.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={agent === item.id}
              onClick={() => setAgent(item.id)}
              className={cn(
                "min-h-10 px-2 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs",
                agent === item.id
                  ? "bg-secondary text-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden border border-border bg-card">
        <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground sm:text-sm">
            {command}
          </code>
          <button
            type="button"
            onClick={() => copyText(command, "command")}
            className="inline-flex min-h-9 shrink-0 items-center gap-2 border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary"
            aria-label="Copy install command"
          >
            {copied === "command" ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            <span className="hidden sm:inline">{copied === "command" ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {mode === "skill" ? (
          <div className="flex flex-col gap-2 border-t border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <FileCode2 className="size-3.5" aria-hidden />
                SKILL.md
              </div>
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {selectedAgent.path}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={copySkillFile}
                className="inline-flex min-h-9 items-center justify-center gap-2 border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-secondary"
              >
                {copied === "skill-file" ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied === "skill-file" ? "Copied" : "Copy file"}
              </button>
              <a
                href={SKILL_URL}
                download="SKILL.md"
                className="inline-flex min-h-9 items-center justify-center gap-2 border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-secondary"
              >
                <Download className="size-3.5" aria-hidden />
                Open file
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {mode === "component"
          ? "Install the React component through the shadcn registry. MIT licensed; no hosted runtime required."
          : `Install the portable Agent Skills file into ${selectedAgent.label}'s project-local skill directory, or copy SKILL.md directly.`}
      </p>
    </div>
  )
}
