import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SeqTooltipProps {
  /** Explanation text. When empty, no tooltip markup is rendered at all. */
  text?: string
  visible: boolean
  placement?: "top" | "bottom"
  children: ReactNode
  className?: string
}

/**
 * Small, non-portaled explanation tooltip shared by participant boxes and
 * message labels. Purely presentational — callers own the hover state so it
 * stays in sync with each element's own outline/highlight behavior.
 */
export function SeqTooltip({
  text,
  visible,
  placement = "top",
  children,
  className,
}: SeqTooltipProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {text ? (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 border border-border bg-popover px-2.5 py-1.5 text-[11px] leading-snug text-popover-foreground shadow-md transition-opacity duration-150",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          {text}
        </div>
      ) : null}
    </div>
  )
}
