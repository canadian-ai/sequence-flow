import Image from "next/image"
import Link from "next/link"

import { EditorWorkbench } from "@/components/demo/editor-workbench"
import { JourneyCatalog } from "@/components/demo/journey-catalog"
import { HeroInstall } from "@/components/hero-install"

const nativeHtml = `<script type="module" src="/sequence-flow.js"></script>
<sequence-flow-journey theme="dark">
  <script type="application/json">
    [{ "id": "discover", "title": "Discover",
       "chart": "sequenceDiagram\\n  Customer->>Team: Share goal" }]
  </script>
</sequence-flow-journey>`

const capabilities = [
  ["Journey first", "Turn a process, system, or customer experience into a guided series of readable steps."],
  ["Business + technical", "Use the same visual language for onboarding, approvals, incidents, auth, payments, and queues."],
  ["Portable by design", "Use React, install from the shadcn registry, embed a Web Component, or export one offline HTML file."],
  ["Agent ready", "Copy an architecture command into your coding agent and begin with a complete, editable use case."],
]

export default function Page() {
  return <main className="min-h-screen overflow-x-hidden">
    <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur" aria-label="Primary navigation">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="#top" className="flex items-center gap-2 font-medium"><Image src="/icon-black.svg" alt="" width={22} height={22} className="size-5 dark:invert" priority /><span>Sequence Flow</span></Link>
        <div className="hidden items-center gap-5 font-mono text-xs text-muted-foreground sm:flex"><Link href="#editor" className="hover:text-foreground">Editor</Link><Link href="#examples" className="hover:text-foreground">Use cases</Link><Link href="#html" className="hover:text-foreground">Native HTML</Link><Link href="https://github.com/canadian-ai/sequence-flow" className="hover:text-foreground">GitHub</Link></div>
      </div>
    </nav>

    <header id="top" className="border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <div className="flex flex-col gap-8 border-border px-4 py-16 sm:px-6 sm:py-24 lg:border-r">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"><span>Open source</span><span>/</span><span>Journeys for people and systems</span><span>/</span><span>MIT</span></div>
          <div className="flex max-w-4xl flex-col gap-5"><h1 className="text-balance font-serif text-5xl font-bold leading-[.98] tracking-tight sm:text-7xl">Make every journey clear enough to act on.</h1><p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">Sequence Flow turns business processes and software architectures into guided, interactive journeys. Author in Markdown or JSON, then ship in React, native HTML, or a self-contained file.</p></div>
          <HeroInstall />
        </div>
        <aside className="flex flex-col bg-card p-4 sm:p-6 lg:justify-between">
          <div className="flex flex-col gap-6"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">One primitive, four outputs</span>{["React component","shadcn registry","Native Web Component","Offline HTML export"].map((item,index)=><div key={item} className="flex items-center justify-between border-b border-border pb-3"><span className="font-serif text-lg font-bold">{item}</span><span className="font-mono text-xs text-muted-foreground">0{index+1}</span></div>)}</div>
          <p className="mt-12 text-sm leading-relaxed text-muted-foreground">Built in Montréal by Canadian AI. No hosted workspace, proprietary file format, or runtime account required.</p>
        </aside>
      </div>
    </header>

    <section id="editor" className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="flex max-w-3xl flex-col gap-2"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">01 / Author and export</span><h2 className="text-balance font-serif text-3xl font-bold sm:text-5xl">Start with the journey, not the diagram.</h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">Write a progressive story in annotated Markdown or JSON. Preview narration, choose a theme, copy React code, or download portable HTML.</p></div>
      <EditorWorkbench />
    </section>

    <section id="examples" className="border-y border-border bg-card"><div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-24"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="flex max-w-3xl flex-col gap-2"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">02 / Use case library</span><h2 className="text-balance font-serif text-3xl font-bold sm:text-5xl">Architecture is more than infrastructure.</h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">Explore customer, operations, healthcare, people, commerce, identity, payments, performance, and infrastructure journeys.</p></div><JourneyCatalog /></div></section>

    <section id="html" className="mx-auto grid w-full max-w-7xl border-x border-border lg:grid-cols-2">
      <div className="flex flex-col gap-6 border-b border-border p-5 sm:p-8 lg:border-r lg:border-b-0"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">03 / Native HTML</span><h2 className="font-serif text-3xl font-bold sm:text-4xl">No React required.</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Register the Web Component once, then provide slides as safe JSON. The custom element owns its accessible controls and isolated styles.</p><pre className="max-w-full overflow-auto border border-border bg-secondary p-4 text-xs leading-relaxed"><code>{nativeHtml}</code></pre></div>
      <div className="flex flex-col gap-6 p-5 sm:p-8"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">04 / Portable export</span><h2 className="font-serif text-3xl font-bold sm:text-4xl">One file. Fully interactive.</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Every example and the live editor can export a responsive HTML file with data, styles, navigation, autoplay, keyboard controls, and dark mode included. It works offline and sends nothing to a server.</p><div className="grid gap-px border border-border bg-border sm:grid-cols-2">{["No network dependency","Safe JSON serialization","Arrow-key navigation","Light and dark themes"].map(item=><div key={item} className="bg-background p-4 text-sm font-medium">{item}</div>)}</div></div>
    </section>

    <section className="border-t border-border"><div className="mx-auto grid w-full max-w-7xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{capabilities.map(([title,body])=><article key={title} className="flex flex-col gap-3 bg-background p-6"><h3 className="font-serif text-xl font-bold">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{body}</p></article>)}</div></section>

    <footer className="border-t border-border"><div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-3"><Image src="/icon-black.svg" alt="Canadian AI" width={22} height={22} className="size-5 dark:invert" /><span>Open source from Canadian AI.</span></div><div className="flex gap-5"><Link href="https://github.com/canadian-ai/sequence-flow" className="hover:text-foreground">GitHub</Link><Link href="https://brand.canadian-ai.ca/components" className="hover:text-foreground">Brand system</Link><Link href="https://canadian-ai.ca" className="hover:text-foreground">Canadian AI</Link></div></div></footer>
  </main>
}
