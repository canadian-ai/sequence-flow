"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"

const RESET_DELAY_MS = 1800

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

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
    <>
      <button
        type="button"
        onClick={copyCommand}
        className="group flex w-full items-center justify-between gap-4 border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/60 sm:w-auto sm:min-w-[560px]"
        aria-label="Copy install command"
      >
        <code className="min-w-0 truncate font-mono text-sm text-foreground">
          {command}
        </code>
        <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </span>
      </button>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md border border-border bg-foreground px-3.5 py-2.5 text-sm text-background shadow-lg transition-all duration-200 ${
          copied
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <Check className="size-4" />
        Install command copied
      </div>
    </>
  )
}
