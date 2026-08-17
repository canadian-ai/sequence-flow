# Sequence Flow

Sequence Flow is a small, open-source developer primitive from [Canadian AI](https://canadian-ai.ca) for rendering Mermaid `sequenceDiagram` syntax as an interactive React Flow canvas.

It is intentionally narrow: install the component into a React application, pass it Mermaid text, and render a readable sequence diagram with pan, zoom, hover highlighting, activation bars, return messages, notes, self-messages, and grouping boxes.

## Install

```bash
npx shadcn@latest add https://sequence-flow-5302.vercel.app/r/sequence-diagram.json
```

Then use it in any height-constrained container:

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

## What this repo is

- A reusable React component for technical diagrams.
- A small Mermaid-compatible parser and layout layer for sequence diagrams.
- A shadcn registry package developers can copy directly into their applications.
- A demo playground for testing diagrams and the component API.

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
