import type { JourneySlide } from "@/components/ui/sequence-diagram"

/**
 * A narrative journey walking through the evolution of a simple web
 * architecture, one system at a time. Each slide is a standalone Mermaid
 * chart — the JourneyPlayer swaps between them like a slideshow.
 */
export const architectureJourney: JourneySlide[] = [
  {
    id: "client-server",
    title: "Step 1 — Client and server",
    caption:
      "We start with the simplest possible shape: a browser talks directly to a web server over HTTP.",
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    B->>W: HTTP GET /products
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "add-database",
    title: "Step 2 — Adding a database",
    caption:
      "The server can't hold everything in memory, so it delegates persistence to a dedicated database and queries it per request.",
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    participant D as Database
    B->>W: HTTP GET /products
    W->>D: SELECT * FROM products
    D-->>W: Rows
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "add-cache",
    title: "Step 3 — Introducing a cache",
    caption:
      "Repeated queries for the same data are wasteful. A cache sits in front of the database and short-circuits the round trip on a hit.",
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    participant C as Cache
    participant D as Database
    B->>W: HTTP GET /products
    W->>C: GET products
    C-->>W: Cache miss
    W->>D: SELECT * FROM products
    D-->>W: Rows
    W->>C: SET products
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "full-picture",
    title: "Step 4 — The full picture",
    caption:
      "Group the backend into a single tier and the whole request path reads as one coherent flow: browser in, cache-aware server tier, database of record.",
    chart: `
    sequenceDiagram
    participant B as Browser
    box Server Tier
    participant W as Web Server
    participant C as Cache
    participant D as Database
    end
    B->>W: HTTP GET /products
    W->>C: GET products
    C-->>W: Cache hit
    W-->>B: 200 OK (HTML)
    `,
  },
]
