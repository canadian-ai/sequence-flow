# Sequence Flow

Sequence Flow is a small, open-source developer primitive from [Canadian AI](https://canadian-ai.ca) for rendering Mermaid `sequenceDiagram` syntax as an interactive React Flow canvas and chaining multiple diagrams into progressive journeys.

It is intentionally narrow: install the component into a React application, pass Mermaid text to `SequenceDiagram` or a `JourneySlide[]` to `JourneyPlayer`, and render readable technical flows with pan, zoom, hover highlighting, activation bars, return messages, notes, self-messages, grouping boxes, and guided walkthroughs.

## Install

```bash
npx shadcn@latest add https://sequence-flow.canadian-ai.app/r/sequence-diagram.json
```

## Pass a sequence flow

Use `SequenceDiagram` in any height-constrained container:

```tsx
import { SequenceDiagram } from "@/components/ui/sequence-diagram"

const chart = `sequenceDiagram
    participant B as Browser
    participant S as Server
    B->>S: Request
    S-->>B: Response`

export function Example() {
  return (
    <div className="h-[400px]">
      <SequenceDiagram chart={chart} />
    </div>
  )
}
```

## Pass a journey

A journey is an array of `JourneySlide` objects. Each slide owns a standalone Mermaid sequence diagram plus optional title, caption, and per-message commentary.

```tsx
import {
  JourneyPlayer,
  type JourneySlide,
} from "@/components/ui/sequence-diagram"

const journey: JourneySlide[] = [
  {
    id: "request",
    title: "Step 1 — Request",
    caption: "The browser sends a request to the API.",
    chart: `sequenceDiagram
      participant B as Browser
      participant A as API
      B->>A: GET /products`,
  },
  {
    id: "response",
    title: "Step 2 — Response",
    caption: "The API returns the result to the browser.",
    chart: `sequenceDiagram
      participant B as Browser
      participant A as API
      B->>A: GET /products
      A-->>B: 200 OK`,
  },
]

export function JourneyExample() {
  return <JourneyPlayer slides={journey} />
}
```

You can also provide `messageCaptions` on each slide when you want narration to appear as individual messages reveal:

```tsx
const journey: JourneySlide[] = [
  {
    id: "cache",
    title: "Adding a cache",
    chart: `sequenceDiagram
      participant W as Web Server
      participant C as Cache
      W->>C: GET products
      C-->>W: Cache hit`,
    messageCaptions: [
      "The web server checks the cache first.",
      "The cache returns the stored result without touching the database.",
    ],
  },
]
```

If `messageCaptions` is omitted, JourneyPlayer can reuse `%% tooltip:` annotations from the Mermaid source as step commentary.

## Live editor

The demo site includes two mobile-responsive editor tabs:

- **Sequence flow** — edit Mermaid sequence syntax, preview the canvas, tune the theme, and export the diagram.
- **Journey** — edit a complete `JourneySlide[]`, preview the progressive walkthrough, and copy the full React usage.

The code views are designed for full copy-and-paste usage so the rendered example and the integration snippet stay next to each other.

## What this repo is

- A reusable React component for technical diagrams.
- A progressive journey player for multi-step technical walkthroughs.
- A small Mermaid-compatible parser and layout layer for sequence diagrams.
- A shadcn registry package developers can copy directly into their applications.
- A demo playground for testing diagrams, journeys, and the component API.

## What this repo is not

- A hosted diagramming SaaS.
- A project-management or collaboration product.
- A backend service or proprietary Canadian AI runtime.
- Documentation for Canadian AI's private platform internals.

The public repository contains only the generic developer-facing primitive. Canadian AI's internal runtime, application architecture, and proprietary platform implementation remain in private repositories.

## Supported syntax

Sequence Flow supports the most common `sequenceDiagram` primitives:

- `participant` and `actor`
- synchronous and asynchronous messages
- dashed return messages
- activation and deactivation bars
- self-messages
- notes
- participant grouping boxes

Unsupported control-flow blocks are ignored gracefully so partial diagrams can still render.

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` to use the playground.

## License

MIT © 2026 Canadian AI Solutions Inc. See [LICENSE](./LICENSE).
