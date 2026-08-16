import Link from "next/link"

import { JourneyPlayer, SequenceDiagram } from "@/components/ui/sequence-diagram"
import { Playground } from "@/components/demo/playground"
import { girlChart } from "@/components/demo/examples"
import { architectureJourney } from "@/components/demo/journeys"

const features = [
  {
    title: "Mermaid syntax",
    body: "Author diagrams with the sequenceDiagram grammar you already know. No node/edge wiring.",
  },
  {
    title: "Activation bars",
    body: "Use +/- suffixes or activate/deactivate to render execution bars on a lifeline.",
  },
  {
    title: "Return messages",
    body: "Dashed arrows (-->>) render as return/response messages with open arrowheads.",
  },
  {
    title: "Notes & badges",
    body: "Note left/right/over places annotated callouts anchored to participants.",
  },
  {
    title: "Self-messages",
    body: "A message from a participant to itself renders as a looping arrow.",
  },
  {
    title: "Grouping boxes",
    body: "Wrap participants in a box to render a labeled tier around their lifelines.",
  },
]

const install =
  "npx shadcn@latest add https://your-registry.com/r/sequence-diagram.json"

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            react-flow
          </span>
          <span className="border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            shadcn registry
          </span>
        </div>
        <h1 className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Sequence diagrams for React Flow
        </h1>
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          A lightweight, read-only sequence diagram component. Write Mermaid
          syntax, get an interactive React Flow canvas with pan, zoom, and hover
          highlighting. Built for the{" "}
          <Link
            href="https://girl.canadian-ai.ca"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            GIRL documentation
          </Link>
          , useful anywhere.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="truncate border border-border bg-card px-3 py-2 font-mono text-sm text-foreground">
            {install}
          </code>
          <Link
            href="https://github.com/xyflow/xyflow"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            React Flow docs
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Live editor
          </h2>
          <span className="text-xs text-muted-foreground">
            Paste Mermaid, recolor it, then export the code or a PNG
          </span>
        </div>
        <Playground />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Journeys
          </h2>
          <span className="text-xs text-muted-foreground">
            Chain multiple diagrams into a slideshow, with nodes animating in on each step
          </span>
        </div>
        <JourneyPlayer slides={architectureJourney} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            GIRL request lifecycle
          </h2>
          <span className="text-xs text-muted-foreground">
            Drag to pan, hover a box or message for details
          </span>
        </div>
        <div className="h-[520px] overflow-hidden border border-border bg-card">
          <SequenceDiagram chart={girlChart} className="size-full" />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          What it supports
        </h2>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2 bg-card p-6">
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border pt-8 text-sm text-muted-foreground">
        Open source. Distributed on the shadcn registry.
      </footer>
    </main>
  )
}
