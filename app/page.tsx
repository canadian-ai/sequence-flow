import Image from "next/image"
import Link from "next/link"

import { EditorWorkbench } from "@/components/demo/editor-workbench"
import { requestLifecycleChart } from "@/components/demo/examples"
import { HeroInstall } from "@/components/hero-install"
import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const quickStartCode = `import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const chart = \`sequenceDiagram
  participant B as Browser
  participant A as API
  B->>A: GET /products
  A-->>B: 200 OK\`

export function RequestFlow() {
  return (
    <div className="h-[360px]">
      <SequenceDiagram chart={chart} />
    </div>
  )
}`

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

      <section aria-labelledby="quick-start" className="min-w-0 space-y-5">
        <div className="flex flex-col gap-2">
          <h2 id="quick-start" className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            60-second quick start
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Install once, paste a diagram, and render it inside a height-constrained container. No account, backend, or hosted runtime is required.
          </p>
        </div>

        <div className="grid overflow-hidden border border-border bg-border lg:grid-cols-[220px_1fr]">
          <ol className="grid gap-px bg-border sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["1", "Install", "Add the component from the public shadcn registry."],
              ["2", "Paste", "Use familiar Mermaid sequenceDiagram syntax."],
              ["3", "Render", "Give the wrapper a height and ship it."],
            ].map(([step, title, body]) => (
              <li key={step} className="bg-card p-4">
                <div className="mb-2 font-mono text-xs text-muted-foreground">{step.padStart(2, "0")}</div>
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <div className="min-w-0 bg-card">
            <div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
              request-flow.tsx
            </div>
            <pre className="max-w-full overflow-x-auto p-4 text-xs leading-relaxed sm:p-5">
              <code>{quickStartCode}</code>
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <a href="#live-editor" className="font-medium text-foreground underline underline-offset-4">
            Try the live editor
          </a>
          <Link
            href="https://github.com/canadian-ai/sequence-flow#write-a-journey-in-markdown"
            className="font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Build a progressive journey
          </Link>
        </div>
      </section>

      <section id="live-editor" className="min-w-0 scroll-mt-6 flex flex-col gap-4">
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
