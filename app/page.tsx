import Image from "next/image"
import Link from "next/link"

import { EditorWorkbench } from "@/components/demo/editor-workbench"
import { requestLifecycleChart } from "@/components/demo/examples"
import { HeroInstall } from "@/components/hero-install"
import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const features = [
  {
    title: "Mermaid syntax",
    body: "Author diagrams with familiar sequenceDiagram grammar instead of wiring nodes and edges by hand.",
  },
  {
    title: "React Flow canvas",
    body: "Pan, zoom, fit, and inspect flows with an interactive canvas that drops into an existing React app.",
  },
  {
    title: "Journeys",
    body: "Pass an array of JourneySlide objects to turn multiple sequence diagrams into a progressive technical walkthrough.",
  },
  {
    title: "Themeable",
    body: "Use CSS variables and standard shadcn tokens so the component inherits the host application's theme.",
  },
  {
    title: "Agent-friendly",
    body: "Install the included Agent Skill for Claude Code, Codex, or OpenCode so coding agents can author and revise diagrams consistently.",
  },
  {
    title: "Copy and paste",
    body: "Preview the exact React usage and copy complete examples directly from the editor into your application.",
  },
]

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 overflow-x-hidden px-4 py-8 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-7 border-b border-border pb-12">
        <Link
          href="https://canadian-ai.ca"
          className="flex w-fit items-center gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Image
            src="/icon-black.svg"
            alt="Canadian AI"
            width={28}
            height={28}
            className="size-7 dark:invert"
            priority
          />
          <span>Open-source developer tool by Canadian AI</span>
        </Link>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              react-flow
            </span>
            <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              shadcn registry
            </span>
            <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              agent skill
            </span>
            <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              MIT
            </span>
          </div>
          <h1 className="max-w-4xl text-balance font-serif text-4xl font-bold tracking-tight sm:text-6xl">
            Sequence diagrams and journeys for React Flow.
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Turn Mermaid
            <code className="mx-1 font-mono text-sm text-foreground">sequenceDiagram</code>
            syntax into an interactive canvas, chain multiple diagrams into a guided journey, or give your coding agent the Sequence Flow skill so it can author them with you.
          </p>
        </div>

        <HeroInstall />
      </header>

      <section className="min-w-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Live editor
          </h2>
          <span className="text-xs text-muted-foreground">
            Switch between sequence flows and multi-step journeys
          </span>
        </div>
        <EditorWorkbench />
      </section>

      <section className="min-w-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Request lifecycle example
          </h2>
          <span className="text-xs text-muted-foreground">
            Drag to pan, hover a box or message for details
          </span>
        </div>
        <div className="h-[420px] min-w-0 overflow-hidden border border-border bg-card sm:h-[520px]">
          <SequenceDiagram chart={requestLifecycleChart} className="size-full" />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Built for developers
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Sequence Flow intentionally stays narrow: installable visualization primitives and portable agent instructions, with no product workspace or proprietary runtime attached.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 bg-card p-6">
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/icon-black.svg"
            alt="Canadian AI"
            width={22}
            height={22}
            className="size-5 dark:invert"
          />
          <span>Built in Montréal by Canadian AI.</span>
        </div>
        <div className="flex gap-4">
          <Link href="https://github.com/canadian-ai/sequence-flow" className="hover:text-foreground hover:underline">
            GitHub
          </Link>
          <Link href="https://canadian-ai.ca" className="hover:text-foreground hover:underline">
            Canadian AI
          </Link>
        </div>
      </footer>
    </main>
  )
}
