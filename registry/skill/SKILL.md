---
name: sequence-diagram
description: >-
  Render read-only sequence diagrams in React Flow from Mermaid sequenceDiagram
  syntax. Use when a developer wants to visualize request flows, protocol
  exchanges, service interactions, or any actor-to-actor message sequence inside
  a React app. Supports activation bars, return/dashed messages, notes,
  self-messages, and participant grouping boxes.
---

# Sequence Diagram (React Flow)

A lightweight, read-only sequence diagram component built on
[`@xyflow/react`](https://reactflow.dev). Diagrams are authored with a subset of
[Mermaid's sequenceDiagram grammar](https://mermaid.js.org/syntax/sequenceDiagram.html)
and rendered as an interactive canvas with pan, zoom, and hover highlighting.

This skill documents only the public developer primitive. It does not describe
or depend on Canadian AI's private runtime or internal application architecture.

## Installation

```bash
npx shadcn@latest add https://sequence-flow-5302.vercel.app/r/sequence-diagram.json
```

This installs the component under `components/ui/sequence-diagram/`, adds the
`@xyflow/react` dependency, and writes the `--seq-*` theme tokens into your
global CSS.

## Basic usage

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

The component fills its parent, so always give the wrapper an explicit height.

## Supported Mermaid syntax

The parser implements the most common `sequenceDiagram` features:

| Feature             | Syntax                                               |
| ------------------- | ---------------------------------------------------- |
| Participant         | `participant A as Alice`                             |
| Actor (person)      | `actor U as User`                                    |
| Sync message        | `A->>B: text` (solid line, filled arrow)             |
| Async message       | `A-)B: text` (solid line, open arrow)                |
| Return message      | `B-->>A: text` (dashed line)                         |
| Lost message        | `A-xB: text` (cross arrowhead)                       |
| Activate target     | `A->>+B: text`                                       |
| Deactivate source   | `B-->>-A: text`                                      |
| Explicit activation | `activate B` / `deactivate B`                        |
| Self message        | `A->>A: text` (loop arrow)                           |
| Note                | `Note left of A: text`, `Note right of A`, `Note over A,B` |
| Grouping box        | `box Label` … participants … `end`                   |

Lines that are not recognized (for example `loop`, `alt`, or `opt` blocks) are
ignored gracefully rather than throwing, so partial diagrams still render.

## Props

| Prop               | Type      | Default | Description                                         |
| ------------------ | --------- | ------- | --------------------------------------------------- |
| `chart`            | `string`  | —       | Mermaid sequenceDiagram source. Required.           |
| `className`        | `string`  | —       | Applied to the canvas wrapper.                      |
| `controls`         | `boolean` | `true`  | Show the zoom/fit control bar.                      |
| `background`       | `boolean` | `true`  | Show the dotted background grid.                    |
| `fitView`          | `boolean` | `true`  | Fit the diagram to the viewport on mount.           |
| `columnGap`        | `number`  | `220`   | Horizontal distance between lifelines.              |
| `messageGap`       | `number`  | `70`    | Vertical distance between consecutive messages.     |
| `showBottomActors` | `boolean` | `true`  | Repeat participant boxes at the bottom.             |

## Theming

The component is themed entirely through CSS variables so it inherits the host
app's light/dark mode:

- `--seq-accent` / `--seq-accent-foreground` — message arrows and label pills
- `--seq-activation` — activation bar fill
- `--seq-lifeline` — dashed lifeline color
- `--seq-group` — grouping box fill

Everything else uses standard shadcn tokens (`--card`, `--border`,
`--muted-foreground`, …). Override any `--seq-*` variable in your CSS to
restyle.

## Public component architecture

- `types.ts` — the parsed diagram model and option types.
- `parser.ts` — converts Mermaid text into the public sequence model.
- `layout.ts` — computes lifeline/message positions and emits React Flow nodes and edges.
- `nodes.tsx` — custom node renderers.
- `edges.tsx` — message edge rendering.
- `context.tsx` — hover state shared between public renderers.
- `sequence-diagram.tsx` — the public `<SequenceDiagram />` component.

## Notes for coding agents

- Always wrap `<SequenceDiagram />` in a height-constrained container.
- The component is read-only by design; do not add editing handlers.
- Prefer editing the `chart` string over manipulating nodes/edges directly.
- The parser is forgiving: unknown control-flow blocks are skipped, not errors.
